import { initState } from './state';

// initMixin给Vue添加init方法的
export function initMixin(Vue) {
  // 用于初始化操作
  Vue.prototype._init = function (options) {
    const vm = this;
    // vue vm.$options 就是用户的配置，此处将options挂在在vue实例上是为了在其他地方能用到
    // 我们使用的vue的时候 $nextTick $attr 等都是在vue的实例上，用$开头
    // 将用户的选项挂在到实例上
    this.$options = options;

    // 初始化状态
    initState(vm);
  };
}
