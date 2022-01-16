/* eslint-disable */

import store from '../store';
import { State } from '@vue/runtime-core';

function loadConfig(): void {
  // @ts-ignore
  window.api.invoke('load-config')
    .then((config: State) => {
      store.commit('set', config);
    });
}

export { loadConfig };
