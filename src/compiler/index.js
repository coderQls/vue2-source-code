import { parseHTML } from './parse';

function genProps(attrs) {
  let str = ''; // {name, value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // console.log(attr);
    if (attr.name === 'style') {
      // style="color: red; background: green" => { style: { color: 'red', background: 'green' } }
      let obj = {};
      attr.value.split(';').forEach((item) => {
        let [key, value] = item.split(':');
        obj[key.trim()] = value.trim();
      });
      attr.value = obj;
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{XXXX}} 匹配到的内容就是表达式的变量
function gen(node) {
  // 是元素
  if (node.type === 1) {
    return codegen(node);
  } else {
    // 文本
    let text = node.text;
    // 文本中不包含mustache语法
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 文本中包含mustache
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        // console.log(match);
        let index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length; // 匹配完后的末尾
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join('+')})`;
    }
  }
}

function genChildren(children) {
  return children.map((child) => gen(child)).join(',');
}

function codegen(ast) {
  let children = genChildren(ast.children);
  // console.log('children', children);
  // _c(标签，属性，children) 创建元素
  // _v() 创建文本
  // _s() JSON.stringify()
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
  }${ast.children.length ? `,${children}` : ''})`;
  return code;
}

// 对模板进行编译处理
export function compileToFunction(template) {
  // 1. 就是将template转化成ast语法树
  let ast = parseHTML(template);

  // 2. 生成render方法（render方法执行后的返的结果就是虚拟dom）

  // 模板引擎的实现原理就是 with + new Function()
  // console.log(codegen(ast));
  let code = codegen(ast);
  code = `with(this) {return ${code}}`;

  // 根据代码生成render函数
  // function render() {
  //   with (this) {
  //     return _c(
  //       'div',
  //       { id: 'app', style: { color: 'red', ' background': 'yellow' } },
  //       _c('div', null, _v(_s(name) + ' hello ' + _s(age))),
  //       _c('span', null, _v('world'))
  //     );
  //   }
  // }
  const render = new Function(code);
  return render;

  // render(h) {
  //   return h('div', { id: 'app' }, h('div', {style: {color: 'red'}}, _v(name + 'hello')))
  // }
}
