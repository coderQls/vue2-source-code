let id = 0;

// 依赖收集器，每个属性对应一个dep实例，用于收集实例的watcher
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 这里存放着当前属性对应的watcher有哪些
  }

  depend() {
    // 这里我们不希望放重复的watcher(即一个组件内多次用到属性时，属性depend只调用一次)，而且刚才只是一个单向的关系 dep -> watcher
    // this.subs.push(Dep.target); // 此处会收集到重复的watcher

    // 将dep传给watcher，让watcher记住dep；Dep.target为当前的watcher
    Dep.target.addDep(this);

    // dep和watcher是一个多对多的关系
    // 一个属性可以在多个组件中使用 （一个dep -> 多个watcher）
    // 一个组件中有多个属性 （一个watcher -> 多个dep）
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    // 通知此dep收集的每个watcher去更新
    this.subs.forEach((watcher) => watcher.update());
  }
}

// Dep.target指向正在渲染的组件，默认没有正在渲染的组件
// 当一个组件渲染完后会重置为null
Dep.target = null;

// 当一个属性绑定多个watcher时，需要用栈来维护
let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;
