import {ActionType} from './action_type.js';
import {
    Collider,
    Solid,
    Combatant,
    Pushable,
    CanPush
}
from './component.js';
import {
    Push,
    PushWalk
} from './action.js';

export class PushSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.JumpPart:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.level.entitySpacialHash.getCart(action.destination);
                for (let e of toCell) {
                    if (e.hasComponent(Pushable)) {
                        action.fail();
                        break;
                    }
                }
            }
            break;
        case ActionType.Push:
        case ActionType.PushWalk:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.level.entitySpacialHash.getCart(action.destination);
                for (let e of toCell) {
                    if (e.hasAnyComponent(Pushable, Solid, Collider, Combatant)) {
                        action.fail();
                        break;
                    }
                }
            }
            break;
        case ActionType.Walk:
            let toCell = this.level.entitySpacialHash.getCart(action.destination);
            let solid = false;
            if (action.entity.hasComponent(Collider)) {
                for (let e of toCell) {
                    if (e.hasComponent(Solid)) {
                        solid = true;
                        action.fail();
                        break;
                    }
                }
            }
            if (!solid && action.entity.hasComponent(CanPush)) {
                for (let e of toCell) {
                    if (e.hasComponent(Pushable)) {
                        action.fail();
                        this.level.scheduleImmediateAction(new Push(e, action.direction));
                        this.level.scheduleImmediateAction(new PushWalk(action.entity, action.direction));
                        break;
                    }
                }
            }
            break;
        }
    }
}
