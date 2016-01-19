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
