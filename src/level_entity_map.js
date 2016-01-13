import {IdMap} from './id_map.js';
import {EntityMap} from './entity.js';

export class LevelEntityMap {
    constructor() {
        this.levelMap = new IdMap();
    }
    get(level, entity) {
        return this.levelMap.get(level).get(entity);
    }
    set(level, entity, value) {
        var entityMap = this.levelMap.get(level);
        if (entityMap == null) {
            entityMap = new EntityMap();
            this.levelMap.set(level, entityMap);
        }
        entityMap.set(entity, value);
    }
    *iterateEntities(level) {
        var entityMap = this.levelMap.get(level);
        if (entityMap != null) {
            yield* entityMap.entities();
        }
    }
}
