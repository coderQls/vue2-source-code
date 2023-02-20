// 因为class会将所有的方法都耦合在一起，所以vue2没使用class，而是使用构造函数的方式

import { initGlobalAPI } from './globalAPI';
import { initMixin } from './init';
import { initLifecycle } from './lifecycle';
import { nextTick } from './observe/watcher';

function Vue(options) {
  // options就是用户的选项
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initMixin(Vue); // 扩展了init方法
initLifecycle(Vue);
initGlobalAPI(Vue);
// initStateMixin(Vue);

export default Vue;
