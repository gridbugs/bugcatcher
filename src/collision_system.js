import {ActionType} from './action_type.js';
import {Collider, Solid, Web, WebProof} from './component.js';
import * as Action from './action.js';

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
            if (!action.entity.hasComponent(WebProof)) {
                let fromCell = this.level.entitySpacialHash.getCart(action.source);
                if (fromCell.hasComponent(Web)) {
                    let web;
                    for (let e of fromCell) {
                        if (e.hasComponent(Web)) {
                            web = e;
                        }
                    }
                    action.fail();
                    this.level.scheduleImmediateAction(new Action.StruggleInWeb(action.entity, web));
                    break;
                }
            }
            break;
        }
    }
}
