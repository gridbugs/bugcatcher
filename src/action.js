import {ActionType} from './action_type.js';
import {DirectionVectors} from './direction.js';
import {Action, IndirectAction} from './base_action.js';

import {
    Door,
    Solid,
    Combatant,
    Tile,
    Getable,
    Position,
    Cooldown,
    WalkTime,
    Actor
} from './component.js';

import {
    CallFunction,
    ActionPair,
    RemoveComponent,
    EnterComponentCooldown,
    ExitComponentCooldown
} from './engine_action.js';

export {
    CallFunction,
    ActionPair,
    RemoveComponent,
    EnterComponentCooldown,
    ExitComponentCooldown
};

export class Walk extends IndirectAction {
    constructor(entity, direction) {
        super();
        this.entity = entity;
        this.direction = direction;
        this.fromCoord = entity.Position.coordinates.clone();
        this.toCoord = this.fromCoord.add(DirectionVectors[direction]);
        this.destination = this.toCoord;
        this.source = this.fromCoord;
    }

    commit(level) {
        level.scheduleImmediateAction(
            new Move(this.entity, this.toCoord)
        );
    }

    get time() {
        if (this.entity.hasComponent(WalkTime)) {
            return this.entity.WalkTime.value;
        }
        return 1;
    }
}
Walk.type = ActionType.Walk;

export class Push extends Action {
    constructor(entity, direction) {
        super();
        this.entity = entity;
        this.direction = direction;
        this.source = entity.Position.coordinates.clone();
        this.destination = this.source.add(DirectionVectors[direction]);
    }

    commit() {
        this.entity.Position.coordinates = this.destination;
    }
}
Push.type = ActionType.Push;

export class PushWalk extends Walk {}
PushWalk.type = ActionType.PushWalk;

export class Teleport extends Action {
    constructor(entity, destination) {
        super();
        this.entity = entity;
        this.destination = destination;
    }

    commit(level) {
        level.scheduleImmediateAction(
            new Move(this.entity, this.destination)
        );
    }
}
Teleport.type = ActionType.Jump;

export class Jump extends Action {
    constructor(entity, path) {
        super();
        this.entity = entity;
        this.path = path;
    }

    commit(level) {
        level.scheduleImmediateAction(
            new JumpPart(this.entity, this, 1)
        );
    }
}
Jump.type = ActionType.Jump;

export class JumpPart extends Action {
    constructor(entity, jump, index) {
        super();
        this.entity = entity;
        this.jump = jump;
        this.index = index;

        this.source = this.entity.Position.coordinates.clone();
        this.destination = this.jump.path.absoluteArray[this.index];
    }

    commit(level) {
        this.entity.Position.coordinates = this.destination;
        var nextIndex = this.index + 1;
        if (nextIndex <= this.jump.path.length) {
            level.scheduleImmediateAction(
                new JumpPart(this.entity, this.jump, nextIndex),
                10
            );
        }

    }
}
JumpPart.type = ActionType.JumpPart;

export class Move extends Action {
    constructor(entity, destination) {
        super();
        this.entity = entity;
        this.destination = destination;
        this.source = entity.Position.coordinates.clone();
    }

    commit() {
        this.entity.Position.coordinates = this.destination;
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

export class Ascend extends IndirectAction {
    constructor(entity, stairs) {
        super();
        this.entity = entity;
        this.stairs = stairs;
    }

    commit(level) {
        level.scheduleImmediateAction(
            new ExitLevel(this.entity, this.stairs.UpStairs.level, this.stairs.UpStairs.coordinates)
        );
    }
}
Ascend.type = ActionType.Ascend;

export class Descend extends IndirectAction {
    constructor(entity, stairs) {
        super();
        this.entity = entity;
        this.stairs = stairs;
    }

    commit(level) {
        level.scheduleImmediateAction(
            new ExitLevel(this.entity, this.stairs.DownStairs.level, this.stairs.DownStairs.coordinates)
        );
    }
    
    shouldReschedule() {
        return false;
    }
}
Descend.type = ActionType.Descend;

export class ExitLevel extends IndirectAction {
    constructor(entity, level, coordinates) {
        super();
        this.entity = entity;
        this.level = level;
        this.coordinates = coordinates;
    }

    commit(level) {
        level.deleteEntity(this.entity);
        this.level.addEntity(this.entity, this.coordinates.x, this.coordinates.y);
        
        this.level.scheduleImmediateAction(new EnterLevel(this.entity, this.level, this.coordinates));
    }
}
ExitLevel.type = ActionType.ExitLevel;

export class EnterLevel extends IndirectAction {
    constructor(entity, level, coordinates) {
        super();
        this.entity = entity;
        this.level = level;
        this.coordinates = coordinates;
    }

    commit() {
        this.level.scheduleActorTurn(this.entity);
    }
}
EnterLevel.type = ActionType.EnterLevel;

export class MeleeAttack extends Action {
    constructor(entity, target) {
        super();
        this.entity = entity;
        this.attacker = entity;
        this.target = target;
    }
}
MeleeAttack.type = ActionType.MeleeAttack;

export class MeleeAttackDodge extends Action {
    constructor(attack) {
        super();
        this.entity = attack.target;
        this.attack = attack;
        this.attacker = attack.entity;
        this.target = attack.target;
    }
}
MeleeAttackDodge.type = ActionType.MeleeAttackDodge;

export class MeleeAttackHit extends Action {
    constructor(attack, damage) {
        super();
        this.entity = attack.target;
        this.attacker = attack.entity;
        this.target = attack.target;
        this.attack = attack;
        this.damage = damage;
    }

    commit(level) {
        this.entity.Health.value -= this.damage;
        if (this.entity.Health.value <= 0) {
            level.scheduleImmediateAction(new Die(this.entity, this.attack));
        }
    }
}
MeleeAttackHit.type = ActionType.MeleeAttackHit;

export class MeleeAttackBlock extends Action {
    constructor(attack) {
        super();
        this.entity = attack.target;
        this.attack = attack;
        this.attacker = attack.entity;
        this.target = attack.target;
    }
}
MeleeAttackBlock.type = ActionType.MeleeAttackBlock;

export class Die extends Action {
    constructor(entity, attack) {
        super();
        this.entity = entity;
        this.attack = attack;
        this.attacker = attack.entity;
        this.target = attack.target;
    }

    commit() {
        this.entity.removeComponents(Combatant);
        this.entity.Tile.character = '%';
    }
}
Die.type = ActionType.Die;

export class GetItem extends Action {
    constructor(entity, item) {
        super();
        this.entity = entity;
        this.item = item;
    }

    commit(level) {
        level.deleteEntity(this.item);
        this.entity.Inventory.inventory.insert(this.item);
        if (this.item.hasComponent(Actor)) {
            this.item.Actor.disable(level);
        }
    }
}
GetItem.type = ActionType.GetItem;

export class DropItem extends Action {
    constructor(entity, index) {
        super();
        this.entity = entity;
        this.index = index;
        this.item = this.entity.Inventory.inventory.get(index);
    }

    commit(level) {
        this.entity.Inventory.inventory.delete(this.index);
        var vec = this.entity.Position.coordinates;
        level.addEntity(this.item, vec.x, vec.y);
        if (this.item.hasComponent(Actor)) {
            this.item.Actor.enable(level);
        }
    }
}
DropItem.type = ActionType.DropItem;

export class Wait extends Action {
    constructor(entity) {
        super();
        this.entity = entity;
    }
}
Wait.type = ActionType.Wait;

export class Bump extends Action {
    constructor(entity, obstacle) {
        super();
        this.entity = entity;
        this.obstacle = obstacle;
    }
}
Bump.type = ActionType.Bump;

export class EnterCooldown extends Action {
    constructor(entity, time) {
        super();
        this.entity = entity;
        this.entity.addComponent(new Cooldown(time));
    }
}
EnterCooldown.type = ActionType.EnterCooldown;

export class EquipItem extends Action {
    constructor(entity, item) {
        super();
        this.entity = entity;
        this.item = item;
    }

    commit() {
        this.entity.EquipmentSlot.item = this.item;
    }
}
EquipItem.type = ActionType.EquipItem;

export class UnequipItem extends Action {
    constructor(entity) {
        super();
        this.entity = entity;
        this.item = entity.EquipmentSlot.item;
    }

    commit() {
        this.entity.EquipmentSlot.item = null;
    }
}
UnequipItem.type = ActionType.UnequipItem;

export class FailToEquipItem extends IndirectAction {
    constructor(entity, item) {
        super();
        this.entity = entity;
        this.item = item;
    }
}
FailToEquipItem.type = ActionType.FailToEquipItem;
