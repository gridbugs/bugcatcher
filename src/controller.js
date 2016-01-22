import {Directions} from './direction.js';
import {getPlayerAction} from './player_controller.js';
import {shortestPathThroughGrid, shortestPathThroughGridUntilPredicate} from './search.js';
import {arrayRandom} from './util.js';
import {NoResults} from './exception.js';
import * as Action from './action.js';
import * as Component from './component.js';

export {getPlayerAction};

export function getRandomMovement(level, entity) {
    return new Action.Walk(entity, arrayRandom([Directions.North, Directions.East, Directions.South, Directions.West]));
}
export function getWait(level, entity) {
    return new Action.Wait(entity);
}

function shortestPathThroughGridUntilPredicateCardinal(grid, start, predicate, canEnterPredicate) {
    return shortestPathThroughGridUntilPredicate(grid, start, predicate, canEnterPredicate,
                                [Directions.North, Directions.East, Directions.South, Directions.West],
                                () => {return 1;});
}

function shortestPathThroughGridCardinal(grid, start, end, canEnterPredicate) {
    return shortestPathThroughGrid(grid, start, end, canEnterPredicate,
                                [Directions.North, Directions.East, Directions.South, Directions.West],
                                () => {return 1;},
                                (current, destination) => {
                                    return current.getManhattenDistance(destination);
                                });
}

export function moveTowardsPlayer(level, entity) {
    var grid = entity.Memory.value.getSpacialHash(level);
    var canEnter = (entities) => {
        for (let e of entities) {
            if (e.hasComponent(Component.Solid)) {
                return false;
            }
        }
        return true;
    };
    try {
        let path = shortestPathThroughGridUntilPredicateCardinal(
            grid,
            entity.Position.coordinates,
            (entities) => {
                for (let e of entities) {
                    if (e.hasComponent(Component.PlayerCharacter)) {
                        return true;
                    }
                }
                return false;
            },
            canEnter
        );
        entity.Actor.lastPlayerPosition = path.end;
        if (path.directions.length == 0) {
            return new Action.Wait(entity);
        }
        return new Action.Walk(entity, path.directions[0]);
    } catch (e) {
        if (e instanceof NoResults) {
            if (entity.Actor.lastPlayerPosition != null) {
                try {
                    let path = shortestPathThroughGridCardinal(
                        grid,
                        entity.Position.coordinates,
                        entity.Actor.lastPlayerPosition,
                        canEnter
                    );
                    if (path != null && path.directions.length == 0) {
                        this.lastPlayerPosition = null;
                        return new Action.Wait(entity);
                    }
                    return new Action.Walk(entity, path.directions[0]);
                } catch (e) {
                    if (e instanceof NoResults) {
                        return getRandomMovement(level, entity);
                    } else {
                        throw e;
                    }
                }
            }
        } else {
            throw e;
        }
    }

    return new Action.Wait(entity);
}
