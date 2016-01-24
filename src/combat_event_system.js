import {ActionType} from './action_type.js';
import {CombatEquipmentEvent, CombatEvent, EquipmentSlot} from './component.js';

export class CombatEventSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.MeleeAttackHit:
            if (action.attacker.hasComponent(EquipmentSlot)) {
                if (action.attacker.EquipmentSlot.item != null) {
                    if (action.attacker.EquipmentSlot.item.hasComponent(CombatEquipmentEvent)) {
                        action.attacker.EquipmentSlot.item.CombatEquipmentEvent.event(this.level, action.attacker, action.attacker.EquipmentSlot.item, action.target);
                    }
                }
            }
            if (action.attacker.hasComponent(CombatEvent)) {
                action.attacker.CombatEvent.event(this.level, action.attacker, action.target);
            }
            break;
        }
    }
}
