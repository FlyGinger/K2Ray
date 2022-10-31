use std::{
    io::{BufReader, Read},
    process::{Child, Command, Stdio},
    sync::{
        mpsc::{channel, Sender, TryRecvError::Disconnected},
        Mutex,
    },
    thread,
};
use tauri::Window;

pub struct V2RayManager {
    v2ray_handle: Mutex<Option<Child>>,
    log_emitter_closer: Mutex<Option<Sender<bool>>>,
}

pub fn create_v2ray_manager() -> V2RayManager {
    V2RayManager {
        v2ray_handle: Mutex::new(None),
        log_emitter_closer: Mutex::new(None),
    }
}

fn _is_v2ray_alive(p: &mut Child) -> bool {
    let is_not_alive = p.try_wait();
    match is_not_alive {
        Ok(None) => true,
        _ => false,
    }
}

#[tauri::command]
pub fn is_v2ray_alive(state: tauri::State<V2RayManager>) -> bool {
    let mut v2ray_process = state.v2ray_handle.lock().unwrap();
    _is_v2ray_alive(v2ray_process.as_mut().unwrap())
}

#[tauri::command]
pub fn run_v2ray(state: tauri::State<V2RayManager>, window: Window) -> bool {
    let mut v2ray_process = state.v2ray_handle.lock().unwrap();

    // 如果已有进程，还需检查是否已经停止
    if v2ray_process.is_some() && _is_v2ray_alive(v2ray_process.as_mut().unwrap()) {
        return true;
    }

    // 没有进程，或者已有进程已经停止，则新开进程
    let cmd = Command::new("")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();
    match cmd {
        Ok(mut v) => {
            // 获取标准输出和标准错误
            let out_pipe = v.stdout.take().unwrap();
            let err_pipe = v.stderr.take().unwrap();
            let mut out_pipe = BufReader::new(out_pipe);
            let mut err_pipe = BufReader::new(err_pipe);

            // 保存关闭器
            let (sender, receiver) = channel::<bool>();
            state.log_emitter_closer.lock().unwrap().replace(sender);

            // 开新线程
            thread::spawn(move || {
                let mut buffer = [0; 256];
                loop {
                    // 处理 access 日志
                    if let Ok(v) = out_pipe.read(&mut buffer) {
                        if v > 0 {
                            let result = window.emit("send_access_log", (buffer[0..v]).to_vec());
                            if let Err(_) = result {
                                break;
                            }
                        }
                    } else {
                        break;
                    }

                    // 处理 error 日志
                    if let Ok(v) = err_pipe.read(&mut buffer) {
                        if v > 0 {
                            let result = window.emit("send_error_log", (buffer[0..v]).to_vec());
                            if let Err(_) = result {
                                break;
                            }
                        }
                    } else {
                        break;
                    }

                    // 如果收到停止信号则停止
                    let signal = receiver.try_recv();
                    if let Ok(_) | Err(Disconnected) = signal {
                        break;
                    }
                }
            });

            // 记录下 V2Ray 的线程
            v2ray_process.replace(v);
            true
        }
        _ => false,
    }
}

#[tauri::command]
pub fn stop_v2ray(state: tauri::State<V2RayManager>) -> bool {
    let mut v2ray_process = state.v2ray_handle.lock().unwrap();
    let mut log_emitter_closer = state.log_emitter_closer.lock().unwrap();

    // 没有进程，或者已有进程已经停止，则无需处理
    if v2ray_process.is_none() {
        return true;
    }
    if !_is_v2ray_alive(v2ray_process.as_mut().unwrap()) {
        v2ray_process.take();
        log_emitter_closer.take();
        return true;
    }

    // 否则杀死进程
    let kill_result = v2ray_process.take().unwrap().kill();
    let send_result = log_emitter_closer.take().unwrap().send(true);
    match kill_result {
        Ok(_) => match send_result {
            _ => true,
        },
        Err(_) => false,
    }
}
