// 重写数组中的部分方法

// 获取数组的原型
const oldArrayProto = Array.prototype;

// Object.create() 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）。
// newArrayProto.__proro__ = oldArrayProto
export const newArrayProto = Object.create(oldArrayProto);

// 找到所有的变异方法
let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];

methods.forEach((method) => {
  // 这里重写了数组的方法
  newArrayProto[method] = function (...args) {
    // 内部调用了原来的方法，函数的劫持 切片编程
    // arr.push(1, 2, 3) arr调用了push，this指向arr
    const result = oldArrayProto[method].call(this, ...args);

    // 我们需要对新增的数据再次进行劫持
    let inserted;

    // ob 为Observer的实例
    console.log(111, this);
    let ob = this.__ob__;

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
      default:
        break;
    }

    if (inserted) {
      // 对新增的内容再次进行规划
      ob.observeArray(inserted);
    }
    ob.dep.notify();
    return result;
  };
});
