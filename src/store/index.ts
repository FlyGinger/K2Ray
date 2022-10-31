import { defineStore } from 'pinia'
import { listen } from '@tauri-apps/api/event'

export const useStore = defineStore('main', {
    state: () => ({
        // V2Ray 相关的属性在此文件之外是只读的
        //（没有任何机制保证这一点，只能祈祷开发者在此文件之外不要修改它们）
        v2ray_on: false,
        v2ray_log_size: 200,
        v2ray_access_log: [] as string[],
        v2ray_access_buffer: [] as number[],
        v2ray_error_log: [] as string[],
        v2ray_error_buffer: [] as number[]
    }),

    actions: {
        update(obj: Object) {
            this.$patch(obj)
        },

        pushAccessLog(log: number[]) {
            this.v2ray_access_buffer.push(...log)
            while (true) {
                let index = this.v2ray_access_buffer.findIndex(ch => ch == '\n'.charCodeAt(0))
                if (index >= 0) {
                    this.v2ray_access_log.push(String.fromCharCode(...(this.v2ray_access_buffer.slice(0, index))))
                    while (this.v2ray_access_log.length > this.v2ray_log_size) {
                        this.v2ray_access_log.shift()
                    }
                    this.v2ray_access_buffer = this.v2ray_access_buffer.slice(index + 1)
                } else {
                    break
                }
            }
        },

        pushErrorLog(log: number[]) {
            this.v2ray_error_buffer.push(...log)
            while (true) {
                let index = this.v2ray_error_buffer.findIndex(ch => ch == '\n'.charCodeAt(0))
                if (index >= 0) {
                    this.v2ray_error_log.push(String.fromCharCode(...(this.v2ray_error_buffer.slice(0, index))))
                    while (this.v2ray_error_log.length > this.v2ray_log_size) {
                        this.v2ray_error_log.shift()
                    }
                    this.v2ray_error_buffer = this.v2ray_error_buffer.slice(index + 1)
                } else {
                    break
                }
            }
        }
    }
})


await listen<string>('send_access_log', (event) => {
    const store = useStore();
    // @ts-ignore: why payload is inferred to be string?
    store.pushAccessLog(event.payload)
});

await listen<string>('send_error_log', (event) => {
    const store = useStore();
    // @ts-ignore: why payload is inferred to be string?
    store.pushErrorLog(event.payload)
});
