class Observer {
  constructor (data) {
    this.observe(data)
  }
  observe (data) {
    Object.entries(data).forEach(([k, v]) => {
      this.defineReactive(data, k, v)
      if (typeof v === 'object') this.observe(v)
    })
  }
  defineReactive (obj, key, value) {
    let that = this;
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        Dep.target && dep.addSub(Dep.target);
        return value
      },
      set (newValue) {
        if (newValue !== value) {
          if (typeof newValue === 'object') that.observe(newValue)
          value = newValue;
          dep.notify();
        }
      }
    })
  }
}

class Dep {
  constructor () {
    this.subs = []
  }
  addSub (watcher) {
    this.subs.push(watcher)
  }
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}