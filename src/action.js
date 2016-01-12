import {ActionType} from './action_type.js';
import {CardinalVectors} from './direction.js';

class Action {
    constructor() {
        this.success = true;
    }

    get type() {
        return this.constructor.type;
    }

    fail() {
        this.success = false;
    }

}

export class Move extends Action {
    constructor(entity, direction) {
        super();
        this.entity = entity;
        this.direction = direction;
        this.fromCoord = entity.Position.vec.clone();
        this.toCoord = this.fromCoord.add(CardinalVectors[direction]);
    }

    commit() {
        this.entity.Position.vec.set(this.toCoord);
    }
}
Move.type = ActionType.Move;
