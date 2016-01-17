import {GridSystem} from './grid_system.js';
import {EntitySet} from './entity.js';
import {ActionType} from './action_type.js';

import {Position, Collider, Door, Solid} from './component.js';
import {OpenDoor} from './action.js';

export class DoorSystem extends GridSystem {
    constructor(level, entities, numCols, numRows) {
        super(level, entities, numCols, numRows, EntitySet, (e) => {
            return e.hasComponent(Position) && e.hasAnyComponent(Collider, Door);
        });
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.destination);
                for (let e of toCell.keys()) {
                    if (e.hasComponents(Door, Solid)) {
                        action.fail();

                        this.level.scheduleImmediateAction(new OpenDoor(action.entity, e));
                        break;
                    }
                }
            }
            break;
        case ActionType.JumpPart:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.destination);
                for (let e of toCell.keys()) {
                    if (e.hasComponents(Door, Solid)) {
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
