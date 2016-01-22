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

function canEnter(entity, entities) {
    if (!entity.hasComponent(Component.CanPush) && entities.hasComponent(Component.Pushable)) {
        return false;
    }
    if (entity.hasComponent(Component.Combatant)) {
        for (let e of entities) {
            if (e.hasComponent(Component.Combatant)) {
                if (e.Combatant.value == entity.Combatant.value) {
                    return false;
                }
            }
        }
    }
    return !entities.hasComponent(Component.Solid);
}

function containsPlayerCharacter(entities) {
    return entities.hasComponent(Component.PlayerCharacter);
}

export function moveTowardsPlayer(level, entity) {
    var grid = entity.Memory.value.getSpacialHash(level);
    let path = shortestPathThroughGridUntilPredicateCardinal(
        grid,
        entity.Position.coordinates,
        containsPlayerCharacter,
        (entities) => {return canEnter(entity, entities)}
    );
    if (path) {
        entity.Actor.lastPlayerPosition = path.end;
        if (path.directions.length == 0) {
            return new Action.Wait(entity);
        }
        return new Action.Walk(entity, path.directions[0]);
    }

    if (entity.Actor.lastPlayerPosition != null) {
        let path = shortestPathThroughGridCardinal(
            grid,
            entity.Position.coordinates,
            entity.Actor.lastPlayerPosition,
            (entities) => {return canEnter(entity, entities)}
        );
        if (path) {
            if (path.directions.length == 0) {
                this.lastPlayerPosition = null;
                return new Action.Wait(entity);
            }
            return new Action.Walk(entity, path.directions[0]);
        }
    }
    return getRandomMovement(level, entity);
}
