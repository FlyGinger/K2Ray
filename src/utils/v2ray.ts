import { invoke } from "@tauri-apps/api";

export async function startV2Ray(location: string) {
  await invoke('start_v2ray', { location: location })
}

export async function stopV2Ray() {
  await invoke('stop_v2ray')
}

export async function restartV2Ray(location: string) {
  await stopV2Ray()
  await startV2Ray(location)
}
