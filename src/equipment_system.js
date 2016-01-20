import {ActionType} from './action_type.js';
import {
    EquipmentSlot,
    Cooldown
} from './component.js';
import {
    DropItem,
    UnequipItem,
    EquipItem,
    FailToEquipItem
} from './action.js';

export class EquipmentSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.DropItem:
            if (action.entity.hasComponent(EquipmentSlot) && action.entity.EquipmentSlot.item == action.item) {
                action.fail();
                this.level.scheduleImmediateAction(new UnequipItem(action.entity));
                this.level.scheduleImmediateAction(new DropItem(action.entity, action.index));
            }
            break;
        case ActionType.UnequipItem:
            if (action.entity.EquipmentSlot.item == null) {
                action.fail();
            }
            break;
        case ActionType.EquipItem:
            if (action.item.hasComponent(Cooldown)) {
                action.fail();
                this.level.scheduleImmediateAction(new FailToEquipItem(action.entity, action.item));
            }
            break;
        }
    }
}
