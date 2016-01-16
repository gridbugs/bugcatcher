import {Vec2} from './vec2.js';
import {ComponentTypes, ComponentNames} from './component_type.js';
import {EntityMap} from './entity.js';
import {LevelEntityMap} from './level_entity_map.js';

class Component {
    get name() {
        return ComponentNames[this.type];
    }
    get type() {
        return this.constructor.type;
    }
}

class Statistic extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
}

export class Position extends Component {
	constructor(x, y) {
        super();
        this.vec = new Vec2(x, y);
    }
}
Position.type = ComponentTypes.Position;

export class Tile extends Component {
    constructor(character, colour, backgroundColour, zIndex, bold) {
        super();
        this.character = character;
        this.colour = colour;
        this.backgroundColour = backgroundColour;
        this.zIndex = zIndex;
    }
}
Tile.type = ComponentTypes.Tile;

export class Actor extends Component {
    constructor(observe, getAction) {
        super();
        this.observe = observe;
        this.getAction = getAction;
    }
}
Actor.type = ComponentTypes.Actor;

export class Solid extends Component {}
Solid.type = ComponentTypes.Solid;

export class Collider extends Component {}
Collider.type = ComponentTypes.Collider;

export class PlayerCharacter extends Component {
    constructor() {
        super();
    }
}
PlayerCharacter.type = ComponentTypes.PlayerCharacter;

export class OnLevel extends Component {
    constructor(level) {
        super();
        this.level = level;
    }
}
OnLevel.type = ComponentTypes.OnLevel;

export class Memory extends Component {
    constructor() {
        super();
        this.lastSeenTimes = new LevelEntityMap();
    }
}
Memory.type = ComponentTypes.Memory;

export class Vision extends Component {
    constructor(distance) {
        super();
        this.distance = distance;
    }
}
Vision.type = ComponentTypes.Vision;

export class Opacity extends Component {
    constructor(value) {
        super();
        this.value = value;
    }
}
Opacity.type = ComponentTypes.Opacity;

export class Door extends Component {
    constructor(open = false) {
        super();
        this.open = open;
    }
}
Door.type = ComponentTypes.Door;

export class DownStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
}
DownStairs.type = ComponentTypes.DownStairs;

export class UpStairs extends Component {
    constructor(level, coordinates) {
        super();
        this.level = level;
        this.coordinates = coordinates;
    }
}
UpStairs.type = ComponentTypes.UpStairs;

export class Combatant extends Component {}
Combatant.type = ComponentTypes.Combatant;

export class Health extends Statistic {}
Health.type = ComponentTypes.Health;

export class Armour extends Statistic {}
Armour.type = ComponentTypes.Armour;

export class Dodge extends Statistic {}
Dodge.type = ComponentTypes.Dodge;

export class Accuracy extends Statistic {}
Accuracy.type = ComponentTypes.Accuracy;

export class MeleeDamage extends Statistic {}
MeleeDamage.type = ComponentTypes.MeleeDamage;
