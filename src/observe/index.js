class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性（vue会单独写一些api，$set,$delete）
    this.walk(data);
  }

  // 劫持对象，对属性依次劫持
  walk(data) {
    // 重新定义属性 性能差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
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
      value = newValue;
    },
  });
}

export function observe(data) {
  // 对这个对象进行劫持

  if (typeof data !== 'object' || data == null) {
    return; // 支队对象进项劫持
  }

  // 如果一个对象被劫持了，那就不需要再被劫持了
  //（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}
