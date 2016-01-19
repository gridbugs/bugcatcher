import {Equipper} from './component.js';

export function opposingRoll(lhs, rhs) {
    return (Math.random() * lhs) - (Math.random() * rhs);
}

export function getStatistic(entity, statistic) {
    let total = entity.getComponent(statistic).value;
    if (entity.hasComponent(Equipper) && entity.Equipper.item != null) {
        total += entity.Equipper.item.getComponent(statistic).value;
    }
    return total;
}
