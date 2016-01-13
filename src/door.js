import {SpacialHash} from './spacial_hash.js';
import {EntityMap} from './entity.js';
import {ActionType} from './action_type.js';

import {Position, Collider, Door, Solid} from './component.js';
import {OpenDoor} from './action.js';

export class DoorSystem {
    constructor(level, entities, numCols, numRows) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new SpacialHash(this.numCols, this.numRows, EntityMap).initialize(
            entities,
            (e) => {
                return e.hasComponent(Position) &&
                    e.hasAnyComponent(Collider, Door)
            }
        );
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.toCoord);
                for (let e of toCell.keys()) {
                    if (e.hasComponents(Door, Solid)) {
                        action.fail();

                        this.level.scheduleImmediateAction(new OpenDoor(action.entity, e));
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
