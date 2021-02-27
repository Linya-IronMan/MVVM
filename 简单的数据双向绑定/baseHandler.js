

const get = createGetter(),
      set = createSetter();

const baseHandler = {
    get,
    set
}

function createGetter() {
    return function(target, property, receiver) {
        console.log('getter', target, property)
        if (isObject(target[property])) {
            
        }
        return Reflect.get(...arguments)
    }
}

function createSetter() {
    return function(target, property, value, receiver) {
        console.log('setter', target, property, value)
        return Reflect.set(...arguments)
    }
}

function isObject(target) {
    return typeof target === 'object' && target !== null;
}