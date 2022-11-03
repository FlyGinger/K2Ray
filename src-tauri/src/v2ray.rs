#[cfg(target_os = "windows")]
use os::windows::process::CommandExt;

use std::{
    fs::File,
    io::{BufReader, Read, Write},
    path::Path,
    process::{Child, Command},
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
pub fn start_v2ray(
    state: tauri::State<V2RayManager>,
    window: Window,
    path: String,
    config: String,
) -> bool {
    let v2ray_folder_path = Path::new(&path);
    let v2ray_path = v2ray_folder_path.join("v2ray");
    let v2ray_config_path = v2ray_folder_path.join("config.json");
    let v2ray_access_log_path = v2ray_folder_path.join("access.log");
    let v2ray_error_log_path = v2ray_folder_path.join("error.log");

    // create config.json for v2ray
    let config_file = File::create(v2ray_config_path);
    if let Err(_) = config_file {
        return false;
    } else {
        if let Err(_) = config_file.unwrap().write_all(config.as_bytes()) {
            return false;
        }
    }

    // remove previous access and error file
    File::create(&v2ray_access_log_path).expect("failed to create access.log");
    File::create(&v2ray_error_log_path).expect("failed to create error.log");

    // process in global
    let mut v2ray_process = state.v2ray_handle.lock().unwrap();

    // if process does exist, check whether it has exited
    if v2ray_process.is_some() && _is_v2ray_alive(v2ray_process.as_mut().unwrap()) {
        return true;
    }

    // if there is no process or previous process has exited, launch new one
    #[cfg(target_os = "macos")]
    let cmd = Command::new(v2ray_path.to_str().unwrap())
        .arg("run")
        .spawn();
    #[cfg(target_os = "windows")]
    let cmd = Command::new(v2ray_path.to_str().unwrap())
        .creation_flags(0x08000000)
        .arg("run")
        .spawn();
    match cmd {
        Ok(v) => {
            // save closer to tauri managed state
            let (sender, receiver) = channel::<bool>();
            state.log_emitter_closer.lock().unwrap().replace(sender);

            // create new thread to emit V2Ray log to frontend
            thread::spawn(move || {
                // read access and error file
                let access_file = File::open(v2ray_access_log_path);
                let error_file = File::open(v2ray_error_log_path);
                let mut access_reader = BufReader::new(access_file.unwrap());
                let mut error_reader = BufReader::new(error_file.unwrap());

                let mut buffer = [0; 256];
                loop {
                    // access log in stdout
                    if let Ok(v) = access_reader.read(&mut buffer) {
                        if v > 0 {
                            let result = window.emit("send_access_log", (buffer[0..v]).to_vec());
                            if let Err(_) = result {}
                        }
                    }

                    // error log in stderr
                    if let Ok(v) = error_reader.read(&mut buffer) {
                        if v > 0 {
                            let result = window.emit("send_error_log", (buffer[0..v]).to_vec());
                            if let Err(_) = result {}
                        }
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
