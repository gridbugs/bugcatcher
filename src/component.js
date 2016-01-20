import {Vec2} from './vec2.js';
import {ComponentType, ComponentNames} from './component_type.js';
import {LevelSpacialHash} from './level_spacial_hash.js';
import {NumericInventory} from './numeric_inventory.js';
import {MemoryCell} from './memory_cell.js';
import {
    RemoveComponent,
    ExitComponentCooldown,
    CallFunction,
    ActionPair
} from './engine_action.js';

class Component {
    constructor() {
        this.entity = null;
        this.temporary = false;
        this.ticksRemaining = 0;
        this.displayable = false;
    }
    get name() {
        return ComponentNames[this.type];
    }
    get type() {
        return this.constructor.type;
    }
    afterAdd() {}
    beforeRemove() {}

    setDisplayable(displayName=this.name) {
        this.displayable = true;
        this.displayName = displayName;
        return this;
    }
    clearDisplayable() {
        this.displayable = false;
        return this;
    }

    makeTemporary(ticks, expireMessage=null) {
        this.temporary = true;
        this.ticksRemaining = ticks;
        this.expireMessage=expireMessage;
        return this;
    }
    makePermanent() {
        this.temporary = false;
        this.ticksRemaining = 0;
        return this;
    }
    tick(level) {
        if (this.temporary) {
            --this.ticksRemaining;
            if (this.ticksRemaining == 0) {
                level.scheduleImmediateAction(new RemoveComponent(this.entity, this));
            }
        }
    }
}

class ValueComponent extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
}

class Statistic extends ValueComponent {}

export class Position extends Component {
	constructor(x, y, level) {
        super();
        this._coordinates = new Vec2(x, y);
        this.level = level;
    }

    set coordinates(v) {
        if (this.level != null) {
            let spacialHash = this.level.entitySpacialHash;
            let fromCell = spacialHash.getCart(this._coordinates);
            let toCell = spacialHash.getCart(v);
            fromCell.delete(this.entity);
            toCell.add(this.entity);
        }
        this._coordinates.set(v);
    }

    get coordinates() {
        return this._coordinates;
    }

    afterAdd() {
        if (this.level != null) {
            this.addToSpacialHash();
        }
    }

    beforeRemove() {
        if (this.level != null) {
            this.removeFromSpacialHash();
        }
    }

    addToSpacialHash() {
        this.level.entitySpacialHash.getCart(this._coordinates).add(this.entity);
    }

    removeFromSpacialHash() {
        this.level.entitySpacialHash.getCart(this._coordinates).delete(this.entity);
    }

    clone() {
        return new Position(this._coordinates.x, this._coordinates.y, this.level);
    }
}
Position.type = ComponentType.Position;

export class Tile extends Component {
    constructor(character, colour, backgroundColour, zIndex) {
        super();
        this.character = character;
        this.colour = colour;
        this.backgroundColour = backgroundColour;
        this.zIndex = zIndex;
    }
    clone() {
        return new Tile(this.character, this.colour, this.backgroundColour, this.zIndex);
    }
}
Tile.type = ComponentType.Tile;

export class Actor extends Component {
    constructor(observe, getAction) {
        super();
        this.observe = observe;
        this.getAction = getAction;
        this.active = false;
        this.scheduled = false;
    }

    enable(level) {
        this.active = true;
        if (!this.scheduled) {
            level.scheduleActorTurn(this.entity, 0);
        }
    }

    disable(level) {
        this.active = false;
    }
}
Actor.type = ComponentType.Actor;

export class Solid extends Component {}
Solid.type = ComponentType.Solid;

export class Collider extends Component {}
Collider.type = ComponentType.Collider;

export class PlayerCharacter extends Component {}
PlayerCharacter.type = ComponentType.PlayerCharacter;

export class Memory extends Component {
    constructor() {
        super();
        this.value = new LevelSpacialHash(MemoryCell);
        this.turn = -1;
    }
}
Memory.type = ComponentType.Memory;

export class Vision extends Component {
    constructor(distance) {
        super();
        this.distance = distance;
    }
}
Vision.type = ComponentType.Vision;

export class Opacity extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
}
Opacity.type = ComponentType.Opacity;

export class Door extends Component {
    constructor(open = false) {
        super();
        this.open = open;
    }
}
Door.type = ComponentType.Door;

export class DownStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
}
DownStairs.type = ComponentType.DownStairs;

export class UpStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
}
UpStairs.type = ComponentType.UpStairs;

export class Combatant extends Statistic {}
Combatant.type = ComponentType.Combatant;

export class Health extends Statistic {
    constructor(value, maxValue = value) {
        super(value);
        this.maxValue = maxValue;
    }
}
Health.type = ComponentType.Health;

export class Defence extends Statistic {}
Defence.type = ComponentType.Defence;

export class Dodge extends Statistic {}
Dodge.type = ComponentType.Dodge;

export class Accuracy extends Statistic {}
Accuracy.type = ComponentType.Accuracy;

export class Attack extends Statistic {}
Attack.type = ComponentType.Attack;

export class Name extends Component {
    constructor(fullName, shortName = fullName) {
        super();
        this.fullName = fullName;
        this.shortName = shortName;
        this.value = fullName;
    }
    clone() {
        return new Name(this.fullName.slice(), this.shortName.slice());
    }
}
Name.type = ComponentType.Name;

export class Inventory extends Component {
    constructor(numSlots) {
        super();
        this.inventory = new NumericInventory(numSlots);
    }
    tick(level) {
        super.tick(level);
        for (let item of this.inventory.contents()) {
            item.tickComponents(level);
        }
    }

}
Inventory.type = ComponentType.Inventory;

export class Getable extends Component {}
Getable.type = ComponentType.Getable;

export class Ability extends Component {
    constructor(getAction) {
        super();
        this.getAction = getAction;
        this.coolingDown = false;
        this.cooldownTime = 0;
    }
    cooldown(time) {
        this.coolingDown = true;
        this.cooldownTime = time;
    }
    tick(level) {
        super.tick(level);
        if (this.coolingDown) {
            --this.cooldownTime;
            if (this.cooldownTime == 0) {
                level.scheduleImmediateAction(new ExitComponentCooldown(this.entity, this));
            }
        }
    }
}
Ability.type = ComponentType.Ability;

export class Pushable extends Component {}
Pushable.type = ComponentType.Pushable;

export class CanPush extends Component {}
CanPush.type = ComponentType.CanPush;

export class Cooldown extends Component {
    constructor(remainingTime) {
        super();
        if (remainingTime != undefined) {
            this.makeTemporary(remainingTime);
        }
    }
}
Cooldown.type = ComponentType.Cooldown;

export class EquipmentSlot extends Component {
    constructor(item = null) {
        super();
        this.item = item;
    }
}
EquipmentSlot.type = ComponentType.EquipmentSlot;

export class Timeout extends Component {
    constructor(remainingTime, fn, description) {
        super();
        this.remainingTime = remainingTime;
        this.fn = fn;
        this.description = description;
    }

    progress(level) {
        --this.remainingTime;
        if (this.remainingTime == 0) {
            level.scheduleImmediateAction(new ActionPair(
                new CallFunction(
                    () => {this.fn(this.entity)},
                    this.entity,
                    this.description
                ),
                new RemoveComponent(this.entity, this)
            ));
        }
    }
}
Timeout.type = ComponentType.Timeout;

export class WalkTime extends Statistic {}
WalkTime.type = ComponentType.WalkTime;

export class CombatNeutral extends Component {}
CombatNeutral.type = ComponentType.CombatNeutral;

export class Noteworthy extends Component {}
Noteworthy.type = ComponentType.Noteworthy;
