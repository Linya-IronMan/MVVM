class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        if (this.el) {
            // 能获取到这个元素 才开始编译
            // 1. 先将真实的 DOM 移入内存中 fragment  不再内存中操作，那么每次操作都会非常消耗性能
            // 将dom 节点缓存起来 操作完成之后一起放到 页面中去 性能消耗会降低。
            let fragment = this.node2fragment(this.el)
            // 编译 提取想要的元素节点 v-model 和 文本节点
            this.compile(fragment)
            // 将编译好的fragment 塞回页面中去
            this.el.appendChild(fragment);
            // TODO fragment 释放
        }
    }
    // 专门写一些辅助方法
    isElementNode(node) {
        return node.nodeType === 1;
    }

    // 核心方法
    node2fragment(el) {   
        // 这个fragment 是真的会将页面中的元素取出来存到缓存中
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 不停将第一个节点插入 fragment 
        // childNodes 只能拿到直接子节点 无法拿到子孙节点
        while(firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compile(fragment) {
        
        let childNodes = fragment.childNodes;
        // Array.from 将 NodeList 转化成数组？
        // DOM 其他的属性节点之类的呢
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 元素节点
                // this.compile(node)
                this.compileElement(node)
                this.compile(node)
            } else {
                // 文本节点
                // 编译文本
                this.compileText(node)
            }
        })
        
    }


    // attr：attribute.name of Element
    isReactive(attr) {
        return attr.includes('v-')
    }

    compileElement(node) {
        // v-model

        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name;
            if (this.isReactive(attrName)) {
                // 取到对应的值放到节点中
                // node.value = this.vm.$data[attr.value];
                let expr = attr.value
                const [,dataBindType]  = attrName.split('-')
                CompileUtil[dataBindType](node, this.vm, expr)
            }
        })
    }

    compileText(node){
        // {{ value }}
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) { // {{a}} {{b}} {{c}}
            // node this.vm.$data expr
            // TODO: 替换 模板数据
            CompileUtil['text'](node, this.vm, expr)
        }
    }
    
}

CompileUtil = {
    getVal(vm, expr) {
        expr = expr.split('.')
        const result = expr.reduce((prev, next) => { // vm.$data 
            return prev[next]
        }, vm.$data)
        // console.log(expr, result, '======')
        return result;
    },
    // hello world: {{message.a}} && {{message.b}} 替换其中的 模板数据
    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            const result = this.getVal(vm, arguments[1])
            return result;
        })
    },
    text(node, vm, expr) { 
        // TODO： 文本处理
        let updateFn = this.updater['textUpdater'];
        // expr: message.a => [message, a] vm.$data.message.a
        const regValArr = expr.match(/\{\{(.+?)\}\}/g)
        //NOTE 箭头函数中没有 arguments
        // NOTE: replace 替换多个 正则 循环？
        let value = this.getTextVal(vm, expr)
        // 数据变化后文本节点的 处理
        // {{a}} {{b}}  对于文本节点 需要同时监控两处 a b
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1], (newValue) => {
                // TODO: 这里应该是利用回调函数 使用了 闭包 
                const value = this.getVal(vm, arguments[1])
                console.log(newValue, value, '=====')
                updateFn && updateFn(node, value)
            }) // 监控 expr 的变化
        })
        
        updateFn && updateFn(node, value)
        
    },
    setVal (vm, expr, value) {
        expr = expr.split('.')
        return expr.reduce((prev, next, currentIndex) => {
            if (currentIndex === expr.length -1 ) {
                return prev[next] = value;
            }
            return prev[next]
        }, vm.$data)
    },
    model(node, vm, expr) {
        let updateFn = this.updater['modelUpdater'];
        // 添加监控，数据变化的时候 调用这个 watch 的callback
        new Watcher(vm, expr, (newValue) => {
            // 当值变化后 会调用 cb 将新值 传递
            updateFn && updateFn(node, this.getVal(vm, expr)) 
        })
        // 除了 keyup change 事件 input 事件也可以作为
        node.addEventListener('input', e => {
            let newValue = e.target.value;
            
            this.setVal(vm, expr, newValue);
        })
        updateFn && updateFn(node, this.getVal(vm, expr))
    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value;
        },
        modelUpdater(node, value) {
            node.value = value
        }
    }
}
