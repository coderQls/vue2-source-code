// 因为class会将所有的方法都耦合在一起，所以vue2没使用class，而是使用构造函数的方式

import { initGlobalAPI } from './globalAPI';
import { initMixin } from './init';
import { initLifecycle } from './lifecycle';
import { initStateMixin } from './state';

function Vue(options) {
  // options就是用户的选项
  this._init(options);
}
initMixin(Vue); // 扩展了init方法
initLifecycle(Vue); // vm._update vm._render
initGlobalAPI(Vue); // 全局api的实现
initStateMixin(Vue); // 实现了nextTick和$watch

export default Vue;
