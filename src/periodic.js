import * as Actions from './action.js'
import {Timeout, Poisoned, Inventory} from './component.js';

function processEntityTimeouts(entities, level) {
    for (let entity of entities) {
        if (entity.hasComponent(Timeout)) {
            entity.Timeout.progress(level);
        }
        if (entity.hasComponent(Inventory)) {
            processEntityTimeouts(entity.Inventory.inventory.contents(), level);
        }
    }
}

export function processTimeouts(level) {
    processEntityTimeouts(level.entities, level);
    return true;
}

export function processPoison(level) {
    for (let e of level.entities) {
        if (e.hasComponent(Poisoned)) {
            level.scheduleImmediateAction(new Actions.PoisonDamage(e, e.Poisoned.damage));
            e.Poisoned.time--;
            if (e.Poisoned.time == 0) {
                level.scheduleImmediateAction(new Actions.RemoveComponent(e, e.Poisoned));
            }
        }
    }
    return true;
}
