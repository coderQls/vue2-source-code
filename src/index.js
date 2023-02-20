// 因为class会将所有的方法都耦合在一起，所以vue2没使用class，而是使用构造函数的方式

import { initGlobalAPI } from './globalAPI';
import { initMixin } from './init';
import { initLifecycle } from './lifecycle';
import Watcher, { nextTick } from './observe/watcher';

function Vue(options) {
  // options就是用户的选项
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initMixin(Vue); // 扩展了init方法
initLifecycle(Vue);
initGlobalAPI(Vue);
// initStateMixin(Vue);

// watch最终调用的都是这个api
// exprOrFn 表达式或函数
Vue.prototype.$watch = function (exprOrFn, cb, options) {
  console.log(exprOrFn, cb, options);

  // exprOrfn firstname或() => vm.firstname
  // user表示是否是用户自定义的watch
  new Watcher(this, exprOrFn, { user: true }, cb);
};

export default Vue;
