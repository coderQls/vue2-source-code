import { mergeOptions } from './utils';

export function initGlobalAPI(Vue) {
  Vue.options = {};

  Vue.mixin = function (mixin) {
    // 此处this指向Vue
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
