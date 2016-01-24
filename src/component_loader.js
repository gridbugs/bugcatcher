export var Components = {};
export function loadComponents(components) {
    for (let name in components) {
        Components[name] = components[name];
    }
}
