import {EquipmentSlot} from './component.js';

export function opposingRoll(lhs, rhs) {
    return (Math.random() * lhs) - (Math.random() * rhs);
}

export function getStatistic(entity, statistic) {
    let total = entity.getComponent(statistic).value;
    if (entity.hasComponent(EquipmentSlot) && entity.EquipmentSlot.item != null) {
        total += entity.EquipmentSlot.item.getComponent(statistic).value;
    }
    return total;
}
