export function mkenum(...names) {
    var obj = {};
    var num = 0;
    for (let name of names) {
        obj[name] = num;
        ++num;
    }
    return obj;
}

export function mktable(enumObj, obj) {
    var arr = new Array(Object.keys(obj).length);
    for (let name in obj) {
        arr[enumObj[name]] = obj[name];
    }
    return arr;
}
