import { newArrayProto } from './array';

class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性（vue会单独写一些api，$set,$delete）

    // 这里this指向Observer的实例
    // 给数据加了一个标识，如果数据上有__ob__,则说明这个数据被观测过
    // data.__ob__ = this; 当data为对象时，这样做会使__ob__能一直查找到，出现死循环

    // 解决方法，添加的__ob__属性设置成不可枚举, 则在进入walk函数时，Object.keys 不会包括__ob__
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false,
    });

    // 修改数组很少用索引来操作数组，数组长度过长是，内部劫持会浪费性能
    // 用户一般修改数组，都是通过方法来修改
    if (Array.isArray(data)) {
      // 这里我们可以重写数组中的方法， 7个变异方法是可以修改数组本身的

      // 需要保留原有的特性，并且重写部分方法
      data.__proto__ = newArrayProto;
      console.log('array', data);
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }

  // 劫持对象，对属性依次劫持
  walk(data) {
    // 重新定义属性 性能差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }

  // 对数组中的每个值都观测
  observeArray(data) {
    // 如果数组中的值是对象，也可以观测到
    data.forEach((item) => observe(item));
  }
}

export function defineReactive(target, key, value) {
  // 闭包，value不会被销毁 属性劫持
  // 劫持value，如果value为对象，则会对对象属性再次劫持
  observe(value);

  Object.defineProperty(target, key, {
    // 取值的时候会执行get
    get() {
      console.log('用户取值了');
      return value;
    },

    // 修改或赋值的时候会执行set
    set(newValue) {
      console.log('用户设置值了');
      if (newValue === value) return;

      // 当赋值时，再次劫持新值
      observe(newValue);
      value = newValue;
    },
  });
}

export function observe(data) {
  // 对这个对象进行劫持

  if (typeof data !== 'object' || data == null) {
    return; // 只对对象进项劫持
  }

  // 条件成立则说明被代理过了
  if (data.__ob__ instanceof Observer) return data.__ob__;

  // 如果一个对象被劫持了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}
