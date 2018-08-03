const compileUtil = {
  getVal (vm, expr) {
    return expr.split('.').reduce((p,c) => p[c], vm.$data)
  },
  getTextVal (vm, expr) {
    return expr.replace(/\{\{([^}]+)\}\}/g, (match, expr) => this.getVal(vm, expr));
  },
  setVal (vm, expr, value) {
    const exs = expr.split('.')
    exs.reduce((p, c, i) => {
      if (i === (exs.length - 1)) {
        p[c] = value
      }
      return p[c]
    }, vm.$data)
  },
  text (vm, node, expr) {
    expr.replace(/\{\{([^}]+)\}\}/g, (match, expr) => { 
      new Watcher(vm, expr, newValue => {
        this.updater.text(node, this.getTextVal(vm, expr))
      })
    })
    this.updater.text(node, this.getTextVal(vm, expr))
  },
  model (vm, node, expr) {
    new Watcher(vm, expr, newValue => {
      this.updater.model(node, this.getVal(vm, expr))
    })
    node.addEventListener('input', e => {
      this.setVal(vm, expr, e.target.value)
    })
    this.updater.model(node, this.getVal(vm, expr))
  },
  updater: {
    text (node, value) {
      node.textContent = value
    },
    model (node, value) {
      node.value = value
    }
  }
}

class Compile {
  constructor (el, vm) {
    this.el = document.querySelector(el);
    this.vm = vm;
    
    // 1.将真实dom放进fragment
    let fragment = this.node2Fragment(this.el);
    // 2.编译
    this.compile(fragment)
    // 3.fragment塞进真实dom
    this.el.appendChild(fragment)
  }

  // 核心方法
  compile (fragment) {
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // element
        this.compileElement(node)
        this.compile(node)
      } else {
        // text
        this.compileText(node)
      }
    })
  }
  compileElement (node) {
    // v-model...
    let attrs = node.attributes;
    for (let attr of attrs) {
      if (/^v-(\w+)$/.test(attr.name)) {
        compileUtil[RegExp.$1](this.vm, node, attr.value)
      }
    }
  }
  compileText (node) {
    // {{msg}}
    let expr = node.textContent;
    if (/\{\{[^}]+\}\}/g.test(expr)) {
      compileUtil.text(this.vm, node, expr)
    }
  }
  node2Fragment (node) {
    let fragment = document.createDocumentFragment();
    let firstChild = null;
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  // 辅助方法
  isElementNode (node) {
    return node.nodeType === 1
  }
}
