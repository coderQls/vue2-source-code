import { isSameVnode } from '.';

export function createElm(vnode) {
  let { tag, data, children, text } = vnode;

  // 标签
  if (typeof tag === 'string') {
    // 这里将真实节点与虚拟节点对应起来
    vnode.el = document.createElement(tag);

    patchProps(vnode.el, {}, data);

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

export function patchProps(el, oldProps = {}, props = {}) {
  // 老的属性中有，新属性中没有，则要删除老的
  let oldStyles = oldProps.style;
  let newStyles = props.style;
  for (let key in oldStyles) {
    if (newStyles[key]) {
      el.style[key] = '';
    }
  }
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }

  // 用新的覆盖老的
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
export function patch(oldVnode, vnode) {
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
    return patchVnode(oldVnode, vnode);
  }
}

function patchVnode(oldVnode, vnode) {
  // 1. 两个节点不是同一个节点，直接清除老的换上新的（没有比对了）
  if (!isSameVnode(oldVnode, vnode)) {
    let el = createEl(vnode);
    oldVnode.parentNode.removeChild(el, oldVnode.el);
    return el;
  }

  // 是文本
  let el = (vnode.el = oldVnode.el); // 复用老节点的元素
  if (!oldVnode.tag) {
    if (oldVnode.text !== vnode.text) {
      el.textContent = vnode.text; // 用新的文本覆盖老的
    }
  }

  // 2. 两个节点是同一个节点（判断节点的tag和节点的key）比较两个节点的属性是否有差异（复用老的节点，将差异属性更新）
  patchProps(el, oldVnode.data, vnode.data);

  // 3. 节点比较完毕后就需要比较两者的子节点
  let oldChildren = oldVnode.children || [];
  let newChildren = vnode.children || [];

  console.log(oldChildren, newChildren);
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法，需要比较两个子节点
    updateChildren(el, oldChildren, newChildren);
  }
  // 新节点有子节点，老节点没子节点,则直接渲染新节点
  else if (newChildren.length > 0) {
    mountChildren(el, newChildren);
  }
  // 新节点没有子节点，老节点有子节点，则删除老节点的子节点
  else if (oldChildren.length > 0) {
    el.innerHTML = '';
  }

  return el;
}

// 挂载子节点
function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[1];
    el.appendChild(createElm(child));
  }
}

function updateChildren(el, oldChildren, newChildren) {
  // 采用双指针的方式比较两个节点
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[oldStartIndex];
  let newStartVnode = oldChildren[newStartIndex];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = oldChildren[newEndIndex];

  // 在给动态列表添加key的时候，要尽量避免用索引，因为索引前后都是从0开始，可能会发生错误复用

  // 生成key为索引，值为index的映射表
  function makeIndexMapByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      console.log(child);
      map[child.key] = index;
    });
    return map;
  }

  // 双方有一方头指针大于尾指针则停止循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    }
    // 如果是相同节点，则递归比较子节点(1. 头头比较) abc -> abcd
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = oldChildren[++newStartIndex];
    }

    // (2. 尾尾比较) abc -> dabc
    else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }

    // 交叉比较(3. 尾头比较) abc -> cab
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      // 将旧节点尾部移到头部前面;
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);

      // 旧节点尾部索引前移，新节点头部索引后移
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    // 交叉比较(4. 头尾比较) abc -> bca
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      // 将旧节点头部移到尾部后面;
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);

      // 旧节点头部索引后移，新节点尾部索引前移
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      // 乱序比较
      // 根据老的列表生成一个映射表，用新的列表去找映射表里面的项，找到则移动，找不到则添加，最后多余的删除
      const map = makeIndexMapByKey(oldChildren);
      // 如果moveIndex有值，则说明是需要移动的索引
      let moveIndex = map[newStartVnode.key];
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点，复用
        el.insertBefore(moveVnode, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了,后面遍历删除的时候需跳过
        patchVnode(moveVnode, newStartVnode); // 比对属性和子节点
      }
      // 如果匹配不到，说明是新节点，则添加到老节点头部的前面
      else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 循环比较完毕后，如果新节点开始索引小于新节点结束索引
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      // 这里可能是向后追加，也有可能是向前追加

      //
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null; // 获取下一个元素
      el.insertBefore(childEl, anchor); // anchor为null时，则会被认为是appendChild
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 只有当有值时才需移除
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}
