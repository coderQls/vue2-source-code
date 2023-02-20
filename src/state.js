import Dep from './observe/dep';
import { observe } from './observe/index';
import Watcher from './observe/watcher';

// 初始化状态
export function initState(vm) {
  // 获取所有的选项
  const opts = vm.$options;

  if (opts.data) {
    initData(vm);
  }

  if (opts.computed) {
    initComputed(vm);
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

// 初始化数据
function initData(vm) {
  // data可能是函数和对象
  let data = vm.$options.data;

  // data是用户返回的对象
  data = typeof data === 'function' ? data.call(vm) : data;

  vm._data = data;
  // 对数据进行劫持 vue2里 采用了一个api defineProperty
  observe(data);

  // 将vm._data 用vm来代理 就可以在vm上直接获取或设置data中的值了
  for (let key in data) {
    proxy(vm, '_data', key);
  }
}

// 初始化computed
function initComputed(vm) {
  const computed = vm.$options.computed;

  const watchers = (vm._computedWatchers = {}); // 将计算属性watcher保存到vm上
  for (let key in computed) {
    let userDef = computed[key];

    // 需要监控计算属性中get的变化 fn即为getter
    let fn = typeof userDef === 'function' ? userDef : userDef.get;

    // 如果直接new Watcher默认会直接执行fn
    // 将属性与watcher对应起来
    watchers[key] = new Watcher(vm, fn, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}

// 计算属性中getter只执行一次，后续的取值会从缓存中取
function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性不会去收集依赖，只会让自己的依赖属性收集依赖
function createComputedGetter(key) {
  // 我们需要检测是否需要执行这个getter
  return function () {
    // 此处this指向vm
    console.log(this._computedWatchers[key]);
    const watcher = this._computedWatchers[key]; // 获取到对应属性的watcher

    // 由于第一次求值时已经将dirty设置为false，后续取值时不能进入判断
    if (watcher.dirty) {
      // 如果是ditry是true，就去执行用户传入的函数
      watcher.evaluate();
    }

    // 计算属性出栈后，如果还有渲染watcher，应该让计算属性watcher里面的属性，收集上层watcher
    if (Dep.target) {
      watcher.depend();
    }

    return watcher.value;
  };
}
