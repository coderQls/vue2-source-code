import Watcher from './observe/watcher';
import { createElementVnode, createTextVnode } from './vdom';

function createElm(vnode) {
  let { tag, data, children, text } = vnode;

  // 标签
  if (typeof tag === 'string') {
    // 这里将真实节点与虚拟节点对应起来
    vnode.el = document.createElement(tag);

    patchProps(vnode.el, data);

    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  }
  // 文本
  else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

// 将vdom转化成真实dom
// patch既有初始化的功能，又有更新的功能
// 当oldVnode是真实dom时，则将vnode转换成真实dom，如果是vdom，则对比更新
function patch(oldVnode, vnode) {
  const isRealElement = oldVnode.nodeType;

  // 判断是否是真实元素
  if (isRealElement) {
    const elm = oldVnode;
    const parentElm = elm.parentNode; // 查到父元素
    let newElm = createElm(vnode, parentElm);
    // 将新节点插入到旧节点后面
    parentElm.insertBefore(newElm, elm.nextSibling);
    // 删除旧节点
    parentElm.removeChild(elm);

    return newElm;
  } else {
    // diff
  }
}

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
  const updateComponent = () => {
    vm._update(vm._render()); // vm.$options.render() 返回虚拟节点
  };

  // 这里的el是通过querySelector处理过的
  vm.$el = el;
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
