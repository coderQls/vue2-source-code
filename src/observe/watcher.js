// 每个组件都有其独自的watcher观察其内部数据的变化，从而不会影响其他组件
import { popTarget, pushTarget } from './dep';

let id = 0;

// 每个属性有个dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者来更新）--> 观察者模式

// 1. 当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
// 2. 调用_render 会取值 走到get上
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.vm = vm;
    this.renderWatcher = options; // 是一个渲染过程
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.deps = [];
    this.depsId = new Set();

    this.lazy = options.lazy;
    this.dirty = this.lazy; // 缓存值

    this.value ? undefined : this.get();
  }

  // 一个组件对应着多个属性，重复的属性也不用记录
  addDep(dep) {
    let id = dep.id;
    // 如果depsId Set中没有这个id，则需要添加，让wacher记住这个dep
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      // 让dep记住这个watcher
      dep.addSub(this);
    }
  }

  // 求值
  evaluate() {
    this.value = this.get(); // 获取用户的数据为返回值，并且还需要标识为脏（dirty）
    this.dirty = false;
  }

  get() {
    // 在组件渲染的时候，将Dep.target指向当前渲染的组件
    // Dep.target = this;
    pushTarget(this); // 当渲染时，将当前的watcher入当前属性的栈
    let value = this.getter.call(this.vm); // 会去vm上取值，调用渲染函数 vm._update(vm._render) 取name 和age
    // 当前组件渲染完成后将Dep.target重置为null
    // Dep.target = null;

    // 当渲染完成后，将当前watcher出栈
    popTarget();
    return value;
  }

  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }

  // 更新视图组件
  update() {
    // 如果是计算属性
    if (this.lazy) {
      // 依赖的属性变化了，就标识计算属性时脏值
      this.dirty = true;
    } else {
      // this.get(); // 重新渲染(此处每次数据有更新就会重新渲染，会浪费性能，因此需要放在队列中统一更新)
      queueWatcher(this); // 把当前的watcher暂存提来
    }
  }

  run() {
    this.get();
  }
}

let queue = [];
let has = {};
let pending = false;

// 刷新任务队列
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((watcher) => watcher.run()); // 在刷新的过程中可能还会有新的watcher，重新放到queue中
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;

    // 需要做到不管update执行多少次，但是渲染最终只执行一次

    if (!pending) {
      nextTick(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  waiting = false;
  let cbs = callbacks.slice(0);
  callbacks = [];
  cbs.forEach((cb) => cb());
}

// vue源码中nextTick 没有直接采用某个api，而是采用优雅降级的方式
// 内部先采用的是 promise(ie不兼容) -> MutationObserver(h5的api，只能在浏览器中运行) -> 再考虑ie专享的 setImmediate -> setTimeout

// vue2使用
// let timerFunc;
// if (typeof Promise !== 'undefined') {
//   timerFunc = () => {
//     Promise.resolve().then(flushCallbacks);
//   };
// } else if (typeof MutationObserver !== 'undefined') {
//   let observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
//   let textNode = document.createTextNode(1);
//   // 监控textNode的变化，当textNode改变时，flushCallbacks重新执行
//   observer.observe(textNode, {
//     characterData: true,
//   });
//   timerFunc = () => {
//     textNode.textContent = 2;
//   };
// } else if (typeof setImmediate !== 'undefined') {
//   timerFunc = () => {
//     setImmediate(flushCallbacks);
//   };
// } else {
//   timerFunc = () => {
//     setTimeout(flushCallbacks);
//   };
// }

export function nextTick(cb) {
  callbacks.push(cb); // 维护nextTick中的callback方法
  if (!waiting) {
    // timerFunc(); // 最后一起刷新
    Promise.resolve().then(flushCallbacks); // vue3直接使用promise
    waiting = true;
  }
}

// 需要给每个属性增加一个dep，目的就是收集watcher

// 一个组件中有多个属性（n个属性会对应一个组件）n个dep对应一个watcher
// 一个属性对应多个组件
// 多对多的关系

export default Watcher;
