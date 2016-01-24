import {Grid} from './grid.js';
import {ActionType} from './action_type.js';
import {EntitySet} from './entity_set.js';

export class SpacialHash extends Grid {
    constructor(width, height, Container=EntitySet) {
        super(width, height);
        if (Container != undefined) {
            for (let [i, j] of this.coordinates()) {
                let container = new Container();
                container.x = j;
                container.y = i;
                this.set(j, i, container);
            }
        }
    }

    initialize(entities) {
        for (let entity of entities) {
            let vec = entity.Position.coordinates;
            this.getCart(vec).add(entity);
        }
        return this;
    }

    updateOnMove(fromCoord, toCoord, entity) {
        var fromCell = this.getCart(fromCoord);
        var toCell = this.getCart(toCoord);
        var value = fromCell.get(entity);
        fromCell.delete(entity);
        toCell.set(entity, value);
    }

    updateOnMoveAction(move) {
        this.updateOnMove(move.source, move.destination, move.entity);
    }
}
