import Watcher from './observe/watcher';
import { createElementVnode, createTextVnode } from './vdom';
import { patch } from './vdom/patch';

export function initLifecycle(Vue) {
  // 将虚拟dom生成真是dom
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;

    // 重新挂载更新后的节点
    vm.$el = patch(el, vnode);
  };

  Vue.prototype._c = function () {
    return createElementVnode(this, ...arguments);
  };

  Vue.prototype._v = function () {
    return createTextVnode(this, ...arguments);
  };

  // 将值JSON.stringify转成字符串
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value;
    return JSON.stringify(value);
  };

  // 渲染成虚拟dom
  Vue.prototype._render = function () {
    // 通过ast语法转义后生成的render方法
    // call 让with中的this指向vm
    // 当渲染的时候会从实例中取值，我们就可以将属性和视图绑定在一起
    return this.$options.render.call(this);
  };
}

export function mountComponent(vm, el) {
  // 这里的el是通过querySelector处理过的
  vm.$el = el;

  const updateComponent = () => {
    vm._update(vm._render()); // vm.$options.render() 返回虚拟节点
  };

  // 1. 调用render方法产生虚拟节点 虚拟dom
  const watcher = new Watcher(vm, updateComponent, true); // true用于标识是一个渲染过程

  // console.log(watcher);
  // 2. 根据虚拟dom产生正式dom

  // 3. 插入到el元素中

  // vue核心流程：
  // 1. 创造了响应式数据
  // 2.模板转换成ast语法树
  // 3.将ast语法树转换成了render函数
  // 4. 后续每次更新只需要执行render函数，无需再次执行ast转换过程

  // render 函数会去产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创造真实的dom
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
