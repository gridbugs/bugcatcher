export function mkenum(...names) {
    var obj = {};
    var num = 0;
    for (let name of names) {
        obj[name] = num;
        ++num;
    }
    return obj;
}

export function mknametable(enumObj) {
    var arr = [];
    for (let name in enumObj) {
        arr[enumObj[name]] = name;
    }
    return arr;
}

export function mktable(enumObj, obj) {
    var arr = new Array(Object.keys(obj).length);
    for (let name in obj) {
        arr[enumObj[name]] = obj[name];
    }
    return arr;
}

export function* tableIterator(enumObj, table) {
    for (let name in enumObj) {
        let enumValue = enumObj[name];
        yield [enumValue, table[enumValue]];
    }
}

export function constrain(min, x, max) {
    return Math.min(Math.max(x, min), max);
}

export function arraySwap(array, i, j) {
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

export function arrayRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function arrayShuffle(array) {
    for (let i = 0; i < array.length; ++i) {
        let index = i + Math.floor(Math.random() * (array.length - i))
        arraySwap(array, i, index);
    }
}

export function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

export function* generateNonNull(iterable) {
    for (let x of iterable) {
        if (x != undefined) {
            yield x;
        }
    }
}
