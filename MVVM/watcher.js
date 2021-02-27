class Watcher {
    // cb: 更新函数 callback 缩写 是一个函数
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        this.value = this.get();
    }
    
    getVal(vm, expr) {
        expr = expr.split('.')
        const result = expr.reduce((prev, next) => { // vm.$data 
            return prev[next]
        }, vm.$data)
        return result;
    }

    get() {
        Dep.target = this;
        let value =  this.getVal(this.vm, this.expr)
        Dep.target = null;
        return value
    }

    // 对外暴露的方法
    // NOTE 应该如何控制类中属性和方法的访问？ static private？
    update() {
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if (newValue !== oldValue) {
            this.cb(newValue)
        }
    }
}

// 将新旧值做对比 如果发生了变化 就调用更新方法