import {ActionType} from './action_type.js';
import {CardinalVectors} from './direction.js';
import {Door, Solid} from './component.js';

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

    shouldReschedule() {
        return true;
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

export class OpenDoor extends Action {
    constructor(entity, door) {
        super();
        this.entity = entity;
        this.door = door;
    }

    commit() {
        this.door.Door.open = true;
        this.door.removeComponent(Solid);
        this.door.Tile.character = '-';
        this.door.Opacity.value = 0;
    }
}
OpenDoor.type = ActionType.OpenDoor;

export class CloseDoor extends Action {
    constructor(entity, door) {
        super();
        this.entity = entity;
        this.door = door;
    }

    commit() {
        this.door.Door.open = false;
        this.door.addComponent(new Solid());
        this.door.Tile.character = '+';
        this.door.Opacity.value = 1;
    }
}
CloseDoor.type = ActionType.CloseDoor;

export class Ascend extends Action {
    constructor(entity, stairs) {
        super();
        this.entity = entity;
        this.stairs = stairs;
    }

    commit() {
        this.entity.OnLevel.level.scheduleImmediateAction(
            new ExitLevel(this.entity, this.stairs.UpStairs.level, this.stairs.UpStairs.coordinates)
        );
    }
}
Ascend.type = ActionType.Ascend;

export class Descend extends Action {
    constructor(entity, stairs) {
        super();
        this.entity = entity;
        this.stairs = stairs;
    }

    commit() {
        this.entity.OnLevel.level.scheduleImmediateAction(
            new ExitLevel(this.entity, this.stairs.DownStairs.level, this.stairs.DownStairs.coordinates)
        );
    }
    
    shouldReschedule() {
        return false;
    }
}
Descend.type = ActionType.Descend;

export class ExitLevel extends Action {
    constructor(entity, level, coordinates) {
        super();
        this.entity = entity;
        this.level = level;
        this.coordinates = coordinates;
    }

    commit() {
        this.entity.OnLevel.level.entities.delete(this.entity);
        this.entity.OnLevel.level = this.level;
        this.entity.Position.vec.set(this.coordinates);
        this.entity.OnLevel.level.entities.add(this.entity);
        
        this.level.scheduleImmediateAction(new EnterLevel(this.entity, this.level, this.coordinates));
    }
}
ExitLevel.type = ActionType.ExitLevel;

export class EnterLevel extends Action {
    constructor(entity, level, coordinates) {
        super();
        this.entity = entity;
        this.level = level;
        this.coordinates = coordinates;
    }

    commit() {
        this.entity.OnLevel.level.scheduleActorTurn(this.entity);
    }
}
EnterLevel.type = ActionType.EnterLevel;
