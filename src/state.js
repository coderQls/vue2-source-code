import { observe } from './observe/index';

// 初始化状态
export function initState(vm) {
  // 获取所有的选项
  const opts = vm.$options;

  if (opts.data) {
    initData(vm);
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
