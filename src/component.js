import {Vec2} from './vec2.js';
import {ComponentTypes, ComponentNames} from './component_type.js';
import {EntityMap} from './entity.js';

class Component {
    get name() {
        return ComponentNames[this.type];
    }
    get type() {
        return this.constructor.type;
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
    constructor(character, colour, zIndex) {
        super();
        this.character = character;
        this.colour = colour;
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

export class PlayerCharacter extends Component {}
PlayerCharacter.type = ComponentTypes.PlayerCharacter;

export class Memory extends Component {
    constructor() {
        super();
        this.lastSeenTimes = new EntityMap();
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
