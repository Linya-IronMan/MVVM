
MVVM: Model View ViewModel

数据的双向绑定

1. 数据 => 响应式数据 Object.defineProperty Proxy
2. input => input/keyup => 事件处理函数的绑定 => 改变数据
3. 相关DOM => 数据 => 绑定在一起

这里只是一个MVVM 数据双向绑定的简单实现，没有用到发布订阅模式。