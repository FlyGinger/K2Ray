#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// use state::load_add_state;

fn main() {
  tauri::Builder::default()
    // .manage(load_add_state)
    .system_tray(tauri::SystemTray::default())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
