import {Action, IndirectAction} from './base_action.js';
import {ActionType} from './action_type.js';

export class RemoveComponent extends Action {
    constructor(entity, component) {
        super();
        this.entity = entity;
        this.component = component;
    }

    commit() {
        this.entity.removeComponent(this.component.constructor);
    }
}
RemoveComponent.type = ActionType.RemoveComponent;

export class EnterCooldown extends Action {
    constructor(entity, component, time) {
        super();
        this.entity = entity;
        this.component = component;
        this.time = time;
    }

    commit() {
        this.component.cooldown(this.time);
    }
}
EnterCooldown.type = ActionType.EnterCooldown;

export class ExitCooldown extends Action {
    constructor(entity, component) {
        super();
        this.entity = entity;
        this.component = component;
    }
    commit() {
        this.component.coolingDown = false;
    }
}
ExitCooldown.type = ActionType.ExitCooldown;
