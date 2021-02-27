/* 
* observer
    1. 代理所有数据
    2. 深层代理
    3. 绑定DOM compiler
    4. 数据更新的时候 同步到DOM中
        4.1 key 对应的DOM
 */

 class Observer {

    constructor(data) {
        this.data = data;
        this.observe(data);
    }

    observe(data) {
        // TODO: 数据劫持
        if (!data || typeof data !== 'object') return;

        Object.keys(data).forEach(key => {
            const value = data[key]
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]) // 深度递归劫持
        })
    }

    defineReactive(data, key, value) {
        const that = this;
        let dep = new Dep();
        Object.defineProperty(data, key, {
                enumerable: true,
                configurable: true,
                get() {
                    Dep.target && dep.addSub(Dep.target)
                    return value;
                },
                set(newVal) {
                    if (value === newVal) return
                    // NOTE 这里要特别注意 对于新赋的值 同样需要进行劫持
                    that.observe(newVal)
                    value = newVal
                    dep.notify()
                }
        })
    }
 }


// NOTE 一个 Dep 实例可以看作一个数组，存储了 数据 => 视图 的更新函数
// 当 set 监听到一个数据被更新之后，调用这个数据对应的更新函数
// 更新函数从 compile 中来 compile 负责将数据渲染到 view 
// 更新函数中利用闭包已经存储了对 node 的引用
// set 中也利用闭包存储了 数据 与 更新函数的对应关系。
class Dep {
    constructor() {
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        console.log('notify')
        this.subs.forEach(watcher => watcher.update())
    }
}
