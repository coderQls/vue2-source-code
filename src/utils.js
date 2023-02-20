const strats = {};
const LIFECYCLE = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        // 如果儿子和父亲都有，让父亲和儿子拼在一起
        return p.concat(c);
      } else {
        // 儿子有，父亲没有，则将儿子包装成数组返回
        return [c];
      }
    } else {
      // 如果儿子没有，则用父亲即可
      return p;
    }
  };
});

export function mergeOptions(parent, child) {
  const options = {};

  for (let key in parent) {
    // 循环老的
    if (key) {
      mergeField(key);
    }
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    // 策略模式，用策略模式减少if /else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 如果不在策略中，则以儿子为主
      options[key] = child[key] || parent[key]; // 优先采用儿子的，再采用父亲的
    }
  }
  return options;
}
