import { compileToFunction } from './compiler';
import { initState } from './state';

// initMixin给Vue添加init方法的
export function initMixin(Vue) {
  // 用于初始化操作
  Vue.prototype._init = function (options) {
    const vm = this;
    // vue vm.$options 就是用户的配置，此处将options挂在在vue实例上是为了在其他地方能用到
    // 我们使用的vue的时候 $nextTick $attr 等都是在vue的实例上，用$开头
    // 将用户的选项挂在到实例上
    vm.$options = options;

    // 初始化状态
    initState(vm);

    if (options.el) {
      // 实现数据的挂载
      vm.$mount(options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);

    let options = vm.$options;
    // 先进行查找是否有render函数
    if (!options.render) {
      let template;
      // 如果没有写模板，写了el
      if (!options.template && el) {
        // 则需要把el中的html作为模板(outerHTML 包含当前元素，innerHTML不包含本元素，只包含本元素内部的元素)
        template = el.outerHTML;
      } else if (options.template) {
        template = options.template;
      }
      console.log(template);
      if (template) {
        // 这里需要对模板进行编译
        const render = () => compileToFunction(template);
        options.render = render;
      }
    }

    options.render();

    // script标签引用的vue.global.js,这个编译过程是在浏览器中运行的
    // runtime是不包含模板编译的，整个编译过程是通过loader来转义.vue文件的，用runtime的时候不能使用template
  };
}
