import { defineStore } from 'pinia'
import { listen } from '@tauri-apps/api/event'

export const useStore = defineStore('main', {
    state: () => ({
        // V2Ray process state
        v2ray_on: false,
    }),

    getters: {
        getter_v2ray_on: (state) => state.v2ray_on
    },

    actions: {
        update(obj: Object) {
            this.$patch(obj)
        }
    }
})

await listen<string>('send_access_log', (event) => {
    console.log(event);
});

await listen<string>('send_error_log', (event) => {
    console.log(event);
});
