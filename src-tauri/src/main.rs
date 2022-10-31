#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod v2ray_manager;
use v2ray_manager::{create_v2ray_manager, is_v2ray_alive, run_v2ray, stop_v2ray};

fn main() {
    tauri::Builder::default()
        .manage(create_v2ray_manager())
        .invoke_handler(tauri::generate_handler![
            is_v2ray_alive,
            run_v2ray,
            stop_v2ray
        ])
        .system_tray(tauri::SystemTray::default())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
