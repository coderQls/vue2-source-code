// 创建元素虚拟节点 h(),_c()都是用的这个方法
export function createElementVnode(vm, tag, data, ...children) {
  if (data == null) {
    data = {};
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

// 创建文本虚拟节点_v()
export function createTextVnode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// vdom和ast一样吗？
// ast做的是语法层面的转换，他描述的是语法本身（描述js，css等）
// vdom是描述的dom元素，可以增加一些自定义的属性（描述dom）
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}

// 判断是否是同一个虚拟节点
export function isSameVnode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}
