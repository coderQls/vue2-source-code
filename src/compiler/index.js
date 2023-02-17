const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配到的分组是一个标签名 如：<div
const startTagClose = /^\s*(\/?)>/; // 匹配自闭合标签 <div> 或 <br />
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配结束标签 </div>
// 匹配属性 匹配分组的[1]是属性key，[3] || [4] || [5]是value
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{XXXX}} 匹配到的内容就是表达式的变量

// vue3采用的不是正则

// 解析模板
function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; // 用于存放元素
  let currentParent; // 指向栈中的最后一个
  let root;

  // 最终需要转化成一颗抽象语法树

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    // 是否为空树
    if (!root) {
      root = node; // 如果为空，则当前是树的空节点
    }
    if (currentParent) {
      node.parent = currentParent; // 只赋予了parent属性
      currentParent.children.push(node); // 还需要与父节点的children属性连接
    }

    stack.push(node);
    currentParent = node;
  }

  function chars(text) {
    text = text.trim();
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }

  function end(tag) {
    let node = stack.pop(); // 弹出最后一个
    // if (tag != node) {
    //   console.error('标签不一致');
    // }
    currentParent = stack[stack.length - 1]; // currentParent 重新指向最后一个
  }

  // 指针前进的步数
  function advance(n) {
    html = html.substring(n);
  }

  // 解析开始标签
  function parseStartTag() {
    const start = html.match(startTagOpen);
    // 如果是开始标签
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [], // attrs[0]是key，attr[1]是value
      };
      advance(start[0].length);

      // 如果不是开始标签的结束 就一直匹配下去
      let attr, end;
      // 匹配属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        // console.log('attr', attr);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true, // 如 disabled 属性，没有值时默认值为true
        });
      }
      if (end) {
        advance(end[0].length);
      }
      // console.log(match);
      return match; // 不是开始标签
    }

    return false; // 不是开始标签
  }

  // html最开始的肯定是一个 <
  while (html) {
    // 如果textEnd 为 0，则说明是一个开始标签或结束标签
    // 如果textEnd > 0，则说明就是文本的结束位置
    let textEnd = html.indexOf('<');
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配结果
      if (startTagMatch) {
        // 解析到开始标签
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }

    if (textEnd > 0) {
      const text = html.substring(0, textEnd); // 文本内容
      if (text) {
        // 解析到文本
        chars(text);
        advance(text.length);
      }
    }
  }
  console.log(root);
}

// 对模板进行编译处理
export function compileToFunction(template) {
  // 1. 就是将template转化成ast语法树
  let ast = parseHTML(template);

  // 2. 生成render方法（render方法执行后的返的结果就是虚拟dom）
}
