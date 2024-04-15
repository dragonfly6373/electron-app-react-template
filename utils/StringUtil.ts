export function parseBoolean(str: string) {
    return (/^true$/i).test(str || 'false');
}

// function parseArray<T>(str: string, sep: RegExp = /,\s*/): Array<T> {
//     let test = str.match(/\[.*\]/);
//     // if (test && test.length) return test[1].split(sep).map(i => Object.setPrototypeOf(JSON.parse(i), T.prototype));
//     if (test && test.length) return test[1].split(sep).map(i => Object.assign(Object.create(T.prototype), JSON.parse(i)));
//     return [];
// }
