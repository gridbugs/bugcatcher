import {Entity} from './entity.js';
import {IdMap} from './id_map.js';

export class EntitySet extends IdMap {
    constructor() {
        super(Entity);
    }

    initialize(entities) {
        this.initializeAsSet(entities);
        return this;
    }

    *[Symbol.iterator]() {
        yield* this.keys();
    }
}
