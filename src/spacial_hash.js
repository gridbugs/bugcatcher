import {Grid} from './grid.js';

export class SpacialHash extends Grid {
    constructor(width, height, Container) {
        super(width, height);
        if (Container != undefined) {
            for (let [i, j] of this.coordinates()) {
                this.set(j, i, new Container(j, i));
            }
        }
    }

    initialize(entities, predicate = (e) => {return true;}, f = (e) => {return e;}) {
        for (let entity of entities) {
            if (predicate(entity)) {
                let vec = entity.Position.vec;
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
}

export class AggregateSpacialHash extends SpacialHash {
    constructor(width, height, Container) {
        super(width, height, Container);
    }

    initialize(entities, predicate, f) {
        super.initialize(entities, predicate, f);
        for (let cell of this) {
            cell.updateAggregate();
        }
        return this;
    }

    updateOnMove(fromCoord, toCoord, entity) {
        var fromCell = this.getCart(fromCoord);
        var toCell = this.getCart(toCoord);
        var value = fromCell.get(entity);
        fromCell.delete(entity);
        toCell.set(entity, value);
        fromCell.updateAggregate();
        toCell.updateAggregate();
    }
}
