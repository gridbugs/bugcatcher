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
