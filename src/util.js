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
