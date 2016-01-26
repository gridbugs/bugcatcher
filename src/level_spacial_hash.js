import {IdMap} from './id_map.js';
import {SpacialHash} from './spacial_hash.js';
import {EntitySet} from './entity_set.js';

export class LevelSpacialHash {
    constructor(Container=EntitySet) {
        this.levelMap = new IdMap();
        this.Container = Container;
    }

    getSpacialHash(level) {
        let spacialHash = this.levelMap.get(level);
        if (spacialHash == null) {
            spacialHash = new SpacialHash(level.width, level.height, this.Container);
            this.levelMap.set(level, spacialHash);
        }
        return spacialHash;
    }

    set(level, x, y, value) {
        this.getSpacialHash(level).set(x, y, value);
        
    }
    get(level, x, y) {
        return this.getSpacialHash(level).get(x, y);
    }
    getCart(level, vector) {
        return this.get(level, vector.x, vector.y);
    }

    *iterateCells(level) {
        let spacialHash = this.levelMap.get(level);
        if (spacialHash != null) {
            for (let i = 0; i < spacialHash.height; ++i) {
                for (let j = 0; j < spacialHash.width; ++j) {
                    yield spacialHash.array[i][j].value;
                }
            }
        }
    }
}
