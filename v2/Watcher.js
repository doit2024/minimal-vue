class Watcher {
  constructor (vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.value = this.get()
  }
  getVal (vm, expr) {
    console.log(expr)
    return expr.split('.').reduce((p,c) => p[c], vm.$data)
  }
  get () {
    Dep.target = this;
    return this.getVal(this.vm, this.expr)
  }
  update () {
    const newValue = this.get();
    if (newValue !== this.value) {
      this.cb(newValue)
    }
  }
}