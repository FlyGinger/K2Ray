import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
    state: () => ({
        // V2Ray process state
        v2ray_id: 63814,
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
