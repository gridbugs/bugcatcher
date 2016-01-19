import {Vec2} from './vec2.js';
import {ComponentTypes, ComponentNames} from './component_type.js';
import {LevelSpacialHash} from './level_spacial_hash.js';
import {NumericInventory} from './numeric_inventory.js';

class Component {
    constructor() {
        this.entity = null;
    }
    get name() {
        return ComponentNames[this.type];
    }
    get type() {
        return this.constructor.type;
    }
    afterAdd() {}
    beforeRemove() {}
    clone() {
        return new this.constructor();
    }
}

class ValueComponent extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
    clone() {
        return new this.constructor(this.value);
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
Position.type = ComponentTypes.Position;

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
Tile.type = ComponentTypes.Tile;

export class Actor extends Component {
    constructor(observe, getAction) {
        super();
        this.observe = observe;
        this.getAction = getAction;
    }
    clone() {
        return new Actor(this.observe, this.getAction);
    }
}
Actor.type = ComponentTypes.Actor;

export class Solid extends Component {}
Solid.type = ComponentTypes.Solid;

export class Collider extends Component {}
Collider.type = ComponentTypes.Collider;

export class PlayerCharacter extends Component {}
PlayerCharacter.type = ComponentTypes.PlayerCharacter;

export class Memory extends Component {
    constructor() {
        super();
        this.value = new LevelSpacialHash(Set);
    }
}
Memory.type = ComponentTypes.Memory;

export class Vision extends Component {
    constructor(distance) {
        super();
        this.distance = distance;
    }
    clone() {
        return new Vision(this.distance);
    }
}
Vision.type = ComponentTypes.Vision;

export class Opacity extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
    clone() {
        return new Opacity(this.value);
    }
}
Opacity.type = ComponentTypes.Opacity;

export class Door extends Component {
    constructor(open = false) {
        super();
        this.open = open;
    }
    clone() {
        return new Door(this.open);
    }
}
Door.type = ComponentTypes.Door;

export class DownStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
    clone() {
        return new DownStairs(this.level, this.coordinates.clone());
    }
}
DownStairs.type = ComponentTypes.DownStairs;

export class UpStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
    clone() {
        return new UpStairs(this.level, this.coordinates.clone());
    }
}
UpStairs.type = ComponentTypes.UpStairs;

export class Combatant extends Component {}
Combatant.type = ComponentTypes.Combatant;

export class Health extends Statistic {
    constructor(value, maxValue = value) {
        super(value);
        this.maxValue = maxValue;
    }
    clone() {
        return new Health(this.value, this.maxValue);
    }
}
Health.type = ComponentTypes.Health;

export class Armour extends Statistic {}
Armour.type = ComponentTypes.Armour;

export class Dodge extends Statistic {}
Dodge.type = ComponentTypes.Dodge;

export class Accuracy extends Statistic {}
Accuracy.type = ComponentTypes.Accuracy;

export class MeleeDamage extends Statistic {}
MeleeDamage.type = ComponentTypes.MeleeDamage;

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
Name.type = ComponentTypes.Name;

export class Inventory extends Component {
    constructor(numSlots) {
        super();
        this.inventory = new NumericInventory(numSlots);
    }
    clone() {
        return new Inventory(this.inventory.numSlots);
    }
}
Inventory.type = ComponentTypes.Inventory;

export class Getable extends Component {}
Getable.type = ComponentTypes.Getable;
