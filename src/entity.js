import {ComponentNames} from './component_type.js';

export class Entity {
    constructor(...components) {
        this.id = Entity.nextId;
        ++Entity.nextId;

        Entity.table[this.id] = this;

        this.components = [];
        for (let c of components) {
            this.addComponent(c);
        }
    }

    addComponent(component) {
        this.components[component.type] = component;
        this[ComponentNames[component.type]] = component;
    }

    removeComponent(component) {
        delete this.components[component.type];
        delete this[ComponentNames[component.type]];
    }

    hasComponent(component) {
        return this.components[component.type] != undefined;
    }

    hasComponents(...components) {
        for (let component of components) {
            if (!this.hasComponent(component)) {
                return false;
            }
        }
        return true;
    }

    hasAnyComponent(...components) {
        for (let component of components) {
            if (this.hasComponent(component)) {
                return true;
            }
        }
        return false;
 
    }
}
Entity.nextId = 0;
Entity.table = [];

export class EntityMap {
    constructor() {
        this.array = [];
        this.size = 0;
        this.arrayKeys = new Set();
        this.tmpArray = [null, null];
    }
    delete(entity) {
        delete this.array[entity.id];
        this.arrayKeys.delete(entity.id);
    }
    *keys() {
        for (let i of this.arrayKeys) {
            yield Entity.table[i];
        }
    }
    *entities() {
        yield* this.keys();
    }
    *entries() {
        for (let i of this.arrayKeys) {
            this.tmpArray[0] = Entity.table[i];
            this.tmpArray[1] = this.array[i];
            yield this.tmpArray;
        }
    }
    *values() {
        for (let i of this.arrayKeys) {
            yield this.array[i];
        }
    }
    *[Symbol.iteartor]() {
        yield* this.entries();
    }
    get(entity) {
        return this.array[entity.id];
    }
    set(entity, value) {
        this.array[entity.id] = value;
        this.arrayKeys.add(entity.id);
    }
    add(entity) {
        this.set(entity, entity);
    }
}
