import {LightEntity} from './entity.js';
import {ComponentType} from './component_type.js'
import {ComponentCountingEntitySet} from './entity_set.js';
import {ObjectPool} from './object_pool.js';

function makeMemoryEntity(entity, ret) {

    if (entity.hasComponentType(ComponentType.Position)) {
        ret.addComponent(entity.Position.clone());
    }
    if (entity.hasComponentType(ComponentType.Tile)) {
        ret.addComponent(entity.Tile.clone());
    }
    if (entity.hasComponentType(ComponentType.Name)) {
        ret.addComponent(entity.Name.clone());
    }
    if (entity.hasComponentType(ComponentType.PlayerCharacter)) {
        ret.addComponent(entity.PlayerCharacter.clone());
    }
    if (entity.hasComponentType(ComponentType.Solid)) {
        ret.addComponent(entity.Solid.clone());
    }

    return ret;
}

export class MemoryCell extends ComponentCountingEntitySet {
    constructor() {
        super();
        this.turn = -1;
    }

    see(entity) {
        this.add(makeMemoryEntity(entity, new LightEntity()));
    }
}
