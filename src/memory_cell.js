import {LightEntity} from './entity.js';
import {ComponentType} from './component_type.js';

function makeMemoryEntity(entity) {
    var ret = new LightEntity();

    if (entity.hasComponentType(ComponentType.Position)) {
        ret.addComponent(entity.Position.clone());
    }
    if (entity.hasComponentType(ComponentType.Tile)) {
        ret.addComponent(entity.Tile.clone());
    }
    if (entity.hasComponentType(ComponentType.Name)) {
        ret.addComponent(entity.Name.clone());
    }
    return ret;
}

export class MemoryCell {
    constructor() {
        this.entities = new Set();
        this.turn = -1;
    }

    clear() {
        this.entities.clear();
    }

    see(entity) {
        this.entities.add(makeMemoryEntity(entity));
    }

    *[Symbol.iterator]() {
        yield* this.entities;
    }
}
