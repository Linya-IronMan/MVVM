// import { baseHandler } from 'baseHandler.js'

class MVVM {

    constructor(el, data) {
         
        this.el = document.querySelector(el)
        this._data = data;
        this.domPool = {}

        this.init()       
    }

    init() {
        // 劫持数据 
        this.initData()
        
        // 
        this.initDom()
        console.log(this.domPool)

    }

    initData() {
        const _this = this;
        this.data = new Proxy(this._data, {
            get(target, key, receiver) {
                console.log('getter', target, key)
                return Reflect.get(...arguments)
            },
            set(target, key, value, receiver) { 
                _this.domPool[key].innerHTML = value
                console.log('setter', target, key, value)
                return Reflect.set(...arguments)
            }
        })

        // Object.defineProperty 的绑定明显要麻烦很多，并且先期初始化的时候明显会消耗更多的资源。

        // for (let key in this._data) {
        //     Object.defineProperty(this.data, key, {
        //         get () {
        //             console.log('获取数据：', key, _this._data[key])
        //             return _this._data[key]
        //         },

        //         set (newValue) {   
        //             console.log('设置数据：', key, newValue) 
        //             _this._data[key] = newValue
        //             _this.domPool[key].innerText = newValue
        //         }
        //     })
        // }


        // console.log(this.data['age'])
        // this.data['name'] = 'Karla'
    }

    setData(key, value) {
        this.data[key] = value;
    }


    bindDom(el) {
        const childNodes = el.childNodes

        childNodes.forEach(item => {
            if (item.nodeType === 3) {
                const _value = item.nodeValue.trim()
                if (_value.length) {
                    const _isValid = /\{\{(.+?)\}\}/.test(_value) //  问好 贪婪模式
                    if (_isValid) {
                        const _key = _value.match(/\{\{(.+?)\}\}/)[1].trim()
                        this.domPool[_key] = item.parentNode
                        item.parentNode.innerText = this.data[_key] || undefined
                    }
                }
            }
            item.childNodes && this.bindDom(item)
        })
    }

    initDom() {
        this.bindDom(this.el)
        this.bindInput(this.el)
    }

    bindInput(el) {
        const _allInputs = el.querySelectorAll('input');

        _allInputs.forEach(input => {
            const _vModel = input.getAttribute('v-model');

            if (_vModel) {
                input.addEventListener('change', this.handleInput.bind(this, _vModel, input))
            }
        })
    }

    handleInput(key, input) {
        const _value = input.value
        this.data[key] = _value;
    }

}