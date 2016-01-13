import {ComponentNames} from './component_type.js';
import {IdMap} from './id_map.js';

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

export class EntityMap extends IdMap {
    constructor() {
        super(Entity);
    }
    *entities() {
        yield* this.keys();
    }
}

export class EntitySet extends EntityMap {
    constructor(entities) {
        super();
        this.initializeAsSet(entities);
    }

    *[Symbol.iterator]() {
        yield* this.keys();
    }
}
