import {ComponentNames} from './component_type.js';
import {IdMap} from './id_map.js';

export class LightEntity {
    constructor(components=[]) {
        this.components = [];
        for (let c of components) {
            this.addComponent(c);
        }
    }

    addComponent(component) {
        this.components[component.type] = component;
        this[ComponentNames[component.type]] = component;
        component.entity = this;
        component.afterAdd();
    }

    removeComponent(componentClass) {
        let component = this.components[componentClass.type];
        component.beforeRemove();
        delete this.components[componentClass.type];
        delete this[ComponentNames[componentClass.type]];
        component.entity = null;
    }

    removeComponents(...components) {
        for (let c of components) {
            this.removeComponent(c);
        }
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

    getComponent(component) {
        return this.components[component.type];
    }
}

export class Entity extends LightEntity {
    constructor(...components) {
        super(components);
        this.id = Entity.nextId;
        ++Entity.nextId;
        Entity.table[this.id] = this;
    }
}
Entity.nextId = 0;
Entity.table = [];
