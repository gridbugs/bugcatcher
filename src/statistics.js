export function opposingRoll(lhs, rhs) {
    return (Math.random() * lhs) - (Math.random() * rhs);
}

export function getStatistic(entity, statistic) {
    return entity.getComponent(statistic).value;
}
