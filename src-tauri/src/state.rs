use std::process::Child;

struct AppState {
    // V2Ray process state
    v2ray_on: bool,
    v2ray_handle: Option<Child>,
}

fn load_app_state() -> AppState {
    AppState {
        v2ray_on: false,
        v2ray_handle: None,
    }
}


