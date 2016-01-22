import {ActionType} from './action_type.js';
import {Collider, Solid} from './component.js';

export class CollisionSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
        case ActionType.JumpPart:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.level.entitySpacialHash.getCart(action.destination);
                if (toCell.hasComponent(Solid)) {
                    action.fail();
                    break;
                }
            }
        }
    }
}
