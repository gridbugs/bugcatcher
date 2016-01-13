import {SpacialHash} from './spacial_hash.js';
import {EntityMap} from './entity.js';
import {ActionType} from './action_type.js';

import {Position, Collider, Solid} from './component.js';

export class CollisionSystem {
    constructor(level, entities, numCols, numRows) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new SpacialHash(this.numCols, this.numRows, EntityMap).initialize(
            entities,
            (e) => {
                return e.hasComponent(Position) &&
                    e.hasAnyComponent(Collider, Solid)
            }
        );
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.toCoord);
                for (let e of toCell.keys()) {
                    if (e.hasComponent(Solid)) {
                        action.fail();
                        break;
                    }
                }
            }
            break;
        }
    }

    update(action) {
        switch (action.type) {
        case ActionType.Move:
            this.grid.updateOnMoveAction(action);
            break;
        }
    }
}
