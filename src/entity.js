import {ComponentType, ComponentNames} from './component_type.js';
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

    *iterateComponents() {
        for (let c of this.components) {
            if (c != undefined) {
                yield c;
            }
        }
    }

    tickComponents(level) {
        for (let c of this.iterateComponents()) {
            c.tick(level);
        }
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

    hasComponentType(type) {
        return this.components[type] != undefined;
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

    canSee(vector) {
        var level = this.Position.level;
        var memoryCell = this.Memory.value.getCart(level, vector);
        return memoryCell.turn == this.Memory.turn;
    }

    become(components) {
        for (let c of this.iterateComponents()) {
            if (c.type == ComponentType.Position ||
                c.type == ComponentType.Actor) {
                continue;
            }
            this.removeComponent(c.constructor);
        }
        for (let c of components) {
            if (c.type == ComponentType.Position) {
                this.Position.coordinates = c.coordinates;
                this.Position.level = c.level;
            } else if (c.type == ComponentType.Actor) {
                this.Actor.getAction = c.getAction;
                this.Actor.observe = c.observe;
            } else {
                this.addComponent(c);
            }
        }
    }

    get x() {
        if (this.components[ComponentType.Position] != undefined) {
            return this.Position.coordinates.x;
        }
    }

    get y() {
        if (this.components[ComponentType.Position] != undefined) {
            return this.Position.coordinates.y;
        }
    }
}

export class Entity extends LightEntity {
    constructor(components) {
        super(components);
        this.id = Entity.nextId;
        ++Entity.nextId;
        Entity.table[this.id] = this;
    }
}
Entity.nextId = 0;
Entity.table = [];
