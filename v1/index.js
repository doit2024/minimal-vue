function MV (opts) {
  var data = this.data = opts.data;
  observe(data, this);

  var container = document.querySelector(opts.el);
  var dom = new Compile(container, this);
  container.appendChild(dom);
}

function Dep () {
  this.subs = [];
}

Dep.prototype = {
  addSub: function (sub) {
    this.subs.push(sub);
  },
  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update()
    })
  }
}

function defineReactive (obj, key, val) {
  var dep = new Dep();
  Object.defineProperty(obj, key, {
    get: function () {
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    }
  })
}

function observe (obj, vm) {
  Object.keys(obj).forEach(function (key) {
    defineReactive(vm, key, obj[key]);
  })
}

function Compile (dom, vm) {
  return this.domToFragment(dom, vm);
}

Compile.prototype = {
  domToFragment: function (dom, vm) {
    var frag = document.createDocumentFragment();
    var child = null;
    while (child = dom.firstChild) {
      this.compileElement(child, vm);
      frag.append(child)
    }
    return frag;
  },
  compileElement (node, vm) {
    var reg = /\{\{(.+)\}\}/;
    // 元素节点
    if (node.nodeType === 1) {
      var attrs = node.attributes;
      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].nodeName === 'v-model') {
          var name = attrs[i].nodeValue;
          node.addEventListener('input', function (e) {
            vm[name] = e.target.value;
          });
          new Watcher(vm, node, name, 'value');
        }
      }
      if(reg.test(node.innerText)) {
        var name = RegExp.$1;
        name = name.trim();
        new Watcher(vm, node, name, 'innerText');
      }
    }
    // 文本节点
    if (node.nodeType === 3) {
      if(reg.test(node.nodeValue)) {
        var name = RegExp.$1;
        name = name.trim();
        new Watcher(vm, node, name, 'nodeValue');
      }
    }
  }
}

function Watcher (vm, node, name, type) {
  Dep.target = this;
  this.name = name;
  this.node = node;
  this.type = type;
  this.vm = vm;
  this.update();
  Dep.target = null;
}

Watcher.prototype = {
  update: function () {
    this.get();
    var batcher = new Batcher();
    batcher.push(this);
  },
  get () {
    this.value = this.vm[this.name];
  },
  cb () {
    this.node[this.type] = this.value;
  }
}

function Batcher () {
  this.reset();
}

Batcher.prototype = {
  reset: function () {
    this.has = {};
    this.queue = [];
    this.waiting = false;
  },
  push: function (watcher) {
    if (this.has[watcher.name]) return;
    this.queue.push(watcher);
    this.has[watcher.name] = watcher;

    if (this.waiting) return;
    this.waiting = true;
    setTimeout(() => {
      this.flush();
    })
  },
  flush () {
    this.queue.forEach(watcher => {
      watcher.cb();
    })
    this.reset();
  }
}
