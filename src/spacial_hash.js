import {Grid} from './grid.js';
import {ActionType} from './action_type.js';
import {EntitySet} from './entity_set.js';

export class SpacialHash extends Grid {
    constructor(width, height, Container=EntitySet) {
        super(width, height);
        if (Container != undefined) {
            for (let [i, j] of this.coordinates()) {
                this.set(j, i, new Container());
            }
        }
    }

    initialize(entities, predicate = (e) => {return true;}, f = (e) => {return e;}) {
        for (let entity of entities) {
            if (predicate(entity)) {
                let vec = entity.Position.coordinates;
                this.getCart(vec).set(entity, f(entity));
            }
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

    update(action) {
        let cell;
        switch (action.type) {
        case ActionType.JumpPart:
        case ActionType.Move:
            this.updateOnMoveAction(action);
            break;
        case ActionType.GetItem:
            cell = this.getCart(action.entity.Position.coordinates);
            cell.delete(action.item);
            break;
        case ActionType.DropItem:
            cell = this.getCart(action.entity.Position.coordinates);
            cell.add(action.item);
            break;
        }
    }
}
