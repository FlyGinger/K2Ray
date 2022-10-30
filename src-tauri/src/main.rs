#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .system_tray(tauri::SystemTray::default())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
