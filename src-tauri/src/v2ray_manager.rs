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
    if v2ray_process.is_none() {
        return false;
    } else {
        _is_v2ray_alive(v2ray_process.as_mut().unwrap())
    }
}

#[tauri::command]
pub fn run_v2ray(state: tauri::State<V2RayManager>, window: Window) -> bool {
    let mut v2ray_process = state.v2ray_handle.lock().unwrap();

    // if process does exist, check whether it has exited
    if v2ray_process.is_some() && _is_v2ray_alive(v2ray_process.as_mut().unwrap()) {
        return true;
    }

    // if there is no process or previous process has exited, launch new one
    let cmd = Command::new("/Users/zenk/Applications/V2Ray/v2ray")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();
    match cmd {
        Ok(mut v) => {
            // fetch stdout and stderr
            let out_pipe = v.stdout.take().unwrap();
            let err_pipe = v.stderr.take().unwrap();
            let mut out_pipe = BufReader::new(out_pipe);
            let mut err_pipe = BufReader::new(err_pipe);

            // save closer to tauri managed state
            let (sender, receiver) = channel::<bool>();
            state.log_emitter_closer.lock().unwrap().replace(sender);

            // create new thread to emit V2Ray log to frontend
            thread::spawn(move || {
                let mut buffer = [0; 256];
                loop {
                    // access log in stdout
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

                    // error log in stderr
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

                    // stop if a signal from main thread has been received
                    let signal = receiver.try_recv();
                    if let Ok(_) | Err(Disconnected) = signal {
                        break;
                    }
                }
            });

            // save V2Ray process handle to tauri managed state
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

    // if there is no process or previous process has exited, do (almost) nothing
    if v2ray_process.is_none() {
        return true;
    }
    if !_is_v2ray_alive(v2ray_process.as_mut().unwrap()) {
        v2ray_process.take();
        log_emitter_closer.take();
        return true;
    }

    // if there is an active process, kill it
    let kill_result = v2ray_process.take().unwrap().kill();
    let send_result = log_emitter_closer.take().unwrap().send(true);
    match kill_result {
        Ok(_) => match send_result {
            _ => true,
        },
        Err(_) => false,
    }
}
