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

export class EnterComponentCooldown extends Action {
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
EnterComponentCooldown.type = ActionType.EnterComponentCooldown;

export class ExitComponentCooldown extends Action {
    constructor(entity, component) {
        super();
        this.entity = entity;
        this.component = component;
    }
    commit() {
        this.component.coolingDown = false;
    }
}
ExitComponentCooldown.type = ActionType.ExitComponentCooldown;

export class CallFunction extends Action {
    constructor(fn, entity=null, description='') {
        super();
        this.fn = fn;
        this.entity = entity;
        this.description = description;
    }

    commit() {
        this.fn();
    }
}
CallFunction.type = ActionType.CallFunction;

export class ActionPair extends IndirectAction {
    constructor(first, second) {
        super();
        this.first = first;
        this.second = second;
    }

    commit(level) {
        level.scheduleImmediateAction(this.first);
        level.scheduleImmediateAction(this.second);
    }
}
ActionPair.type = ActionType.ActionPair;


