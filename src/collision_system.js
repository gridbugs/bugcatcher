import {GridSystem} from './grid_system.js';
import {EntitySet} from './entity.js';
import {ActionType} from './action_type.js';

import {Position, Collider, Solid} from './component.js';

export class CollisionSystem extends GridSystem {
    constructor(level, entities, numCols, numRows) {
        super(level, entities, numCols, numRows, EntitySet, (e) => {
            return e.hasComponent(Position) && e.hasAnyComponent(Collider, Solid);
        });
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
        case ActionType.JumpPart:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.destination);
                for (let e of toCell.keys()) {
                    if (e.hasComponent(Solid)) {
                        action.fail();
                        break;
                    }
                }
            }
        }
    }
}
