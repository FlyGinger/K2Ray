#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    ActivationPolicy, AppHandle, CustomMenuItem, GlobalWindowEvent, Manager, SystemTray,
    SystemTrayEvent, SystemTrayMenu, WindowEvent,
};
use tauri_plugin_store;

mod v2ray;
use v2ray::{create_v2ray_manager, is_v2ray_alive, start_v2ray, stop_v2ray};

fn system_tray_menu() -> SystemTray {
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "显示"))
        .add_item(CustomMenuItem::new("quit".to_string(), "退出"));
    SystemTray::new().with_menu(menu)
}

fn system_tray_event_handler(app: &AppHandle, event: SystemTrayEvent) {
    let window = app.get_window("main").unwrap();
    match event {
        SystemTrayEvent::MenuItemClick { tray_id: _, id, .. } => match id.as_str() {
            "show" => {
                window.show().unwrap();
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn window_event_handler(event: GlobalWindowEvent) {
    match event.event() {
        WindowEvent::CloseRequested { api, .. } => {
            event.window().hide().unwrap();
            api.prevent_close();
        }
        _ => {}
    }
}

fn main() {
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_store::PluginBuilder::default().build())
        .manage(create_v2ray_manager())
        .invoke_handler(tauri::generate_handler![
            is_v2ray_alive,
            start_v2ray,
            stop_v2ray
        ])
        .system_tray(system_tray_menu())
        .on_system_tray_event(system_tray_event_handler)
        .on_window_event(window_event_handler)
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.set_activation_policy(ActivationPolicy::Accessory);
    app.run(|_app_handle, _evevt| {});
}
