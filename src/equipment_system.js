import {ActionType} from './action_type.js';
import {
    Equipper
} from './component.js';
import {
    DropItem,
    UnequipItem
} from './action.js';

export class EquipmentSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.DropItem:
            if (action.entity.hasComponent(Equipper) && action.entity.Equipper.item == action.item) {
                action.fail();
                this.level.scheduleImmediateAction(new UnequipItem(action.entity));
                this.level.scheduleImmediateAction(new DropItem(action.entity, action.index));
            }
            break;
        case ActionType.UnequipItem:
            if (action.entity.Equipper.item == null) {
                action.fail();
            }
            break;
        }
    }
}
