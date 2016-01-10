import {Heap} from './heap.js';
import {AvlTree} from './avl_tree.js';
import {Vec2} from './vec2.js';
import {Grid} from './grid.js';
import {getKey, getKeyCode} from './input.js';
import {mdelay} from './time.js';
import {mkenum} from './util.js';

import {CardinalDirections, CardinalVectors} from './direction.js';

class ScheduleEntry {
    constructor(task, absoluteTime, sequenceNumber, immediate) {
        this.task = task;
        this.absoluteTime = absoluteTime;
        this.sequenceNumber = sequenceNumber;
        this.immediate = immediate;
    }
}

class Schedule {
    constructor() {
        this.absoluteTime = 0;
        this.sequenceNumber = 0;
        this.heap = new Heap(Schedule.compare);
    }
    scheduleTask(task, relativeTime, immediate = false) {
        this.heap.insert(new ScheduleEntry(
            task,
            this.absoluteTime + relativeTime,
            this.sequenceNumber,
            immediate
        ));
        ++this.sequenceNumber;
    }

    peek() {
        return this.heap.peek();
    }

    pop() {
        var entry = this.heap.pop();
        this.absoluteTime = entry.absoluteTime;
        return entry;
    }

    get empty() {
        return this.heap.empty;
    }
}
Schedule.compare = (a, b) => {
    if (a.immediate != b.immediate) {
        return b.immediate - a.immediate;
    }
    if (a.absoluteTime != b.absoluteTime) {
        return a.absoluteTime - b.absoluteTime;
    }
    return a.sequenceNumber - b.sequenceNumber;
};


class Entity {
    constructor(...components) {
        this.id = Entity.nextId;
        ++Entity.nextId;

        Entity.table[this.id] = this;

        this.components = {};
        for (let c of components) {
            this.addComponent(c);
        }
    }

    addComponent(component) {
        this.components[component.name] = component;
    }

    removeComponent(name) {
        delete this.components[name];
    }

    hasComponent(name) {
        return this.components[name] != undefined;
    }

    hasComponents(...names) {
        for (let name of names) {
            if (!this.hasComponent(name)) {
                return false;
            }
        }
        return true;
    }

    hasAnyComponent(...names) {
        for (let name of names) {
            if (this.hasComponent(name)) {
                return true;
            }
        }
        return false;
 
    }
}
Entity.nextId = 0;
Entity.table = [];

class EntityMap {
    constructor() {
        this.array = [];
        this.size = 0;
        this.arrayKeys = new Set();
    }
    delete(entity) {
        delete this.array[entity.id];
        this.arrayKeys.delete(entity.id);
    }
    *keys() {
        for (let i of this.arrayKeys) {
            yield Entity.table[i];
        }
    }
    *entries() {
        for (let i of this.arrayKeys) {
            yield [Entity.table[i], this.array[i]];
        }
    }
    get(entity) {
        return this.array[entity.id];
    }
    set(entity, value) {
        this.array[entity.id] = value;
        this.arrayKeys.add(entity.id);
    }
}

class Position {
	constructor(x, y) {
        this.vec = new Vec2(x, y);
    }
    get name() {
        return 'Position';
    }
}

class Tile {
    constructor(character, colour, zIndex) {
        this.character = character;
        this.colour = colour;
        this.zIndex = zIndex;
    }
    get name() {
        return 'Tile';
    }
}

class Actor {
    constructor(observe, getAction) {
        this.observe = observe;
        this.getAction = getAction;
    }
    get name() {
        return 'Actor';
    }
}

class Solid {
    get name() {
        return 'Solid';
    }
}

class Collider {
    get name() {
        return 'Collider';
    }
}

class PlayerCharacter {
    get name() {
        return 'PlayerCharacter';
    }
}

class Memory {
    constructor() {
        this.lastSeenTimes = new EntityMap();
    }
    get name() {
        return 'Memory';
    }
}

class Vision {
    constructor(distance) {
        this.distance = distance;
    }
    get name() {
        return 'Vision';
    }
}

var entities = [];

var worldString = [
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
'&                                               &                       &', 
'&  &             &   &  &&               &              &&              &', 
'&   &      &         & &        ######################    &&&&&     &&  &', 
'&    &                          #....................#        &&&    && &', 
'&      &      ###################....................#     &          &&&', 
'&      &      #........#........#....................#           &      &', 
'& &   &       #........#........#....................#            &     &', 
'&             #........#........#....................#             &    &', 
'& &           #.................#.....................                  &', 
'&             #........#........#....................#   &   &        & &', 
'&     #############.####........#....................#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#........@...........#                  &', 
'&     #................#........#....................#    &     & &     &', 
'&     #................#........#....................#                  &', 
'&  &  .................#........#....................#          & &     &', 
'&     #................#........#....................#      &         & &', 
'&  &  #................###############.###############      &           &', 
'&     #................#...................#                            &', 
'&     #................#...................#               &   &     &  &', 
'&     ##################...................#                            &', 
'&                      #...................#          &                 &', 
'&   & &  &             #....................      &            &    &   &', 
'&         &            #...................#       &  &             &   &', 
'&    &&  & &        &  #...................#        &       &           &', 
'&     &    &        &  #...................#                  &     &   &', 
'&      &    &&&        #####################                        &   &', 
'&                                                                       &', 
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
];

function makeTree(x, y) {
    return new Entity(new Position(x, y), new Tile('&', 'green', 1), new Solid());
}
function makeWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', 'gray', 1), new Solid());
}
function makeGrass(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'brown', 0));
}
function makeFloor(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'gray', 0));
}
function makePlayerCharacter(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('@', 'white', 2),
                        new Actor(observeCircle, getPlayerAction),
                        new PlayerCharacter(),
                        new Collider(),
                        new Memory(),
                        new Vision(10)
                    );
}

function* observeCircle(observer) {
    var eyePosition = observer.components.Position.vec;
    var viewDistance = observer.components.Vision.distance;
    var viewDistanceSquared = viewDistance * viewDistance;
    for (let entity of entities) {
        if (entity.hasComponent('Position')) {
            var entityPosition = entity.components.Position.vec;
            var distanceSquared = eyePosition.getDistanceSquared(entityPosition);
            if (distanceSquared <= viewDistanceSquared) {
                yield entity;
            }
        }
    }
}

function initWorld() {
    for (let i = 0; i < worldString.length; ++i) {
        let line = worldString[i];
        for (let j = 0; j < line.length; ++j) {
            let ch = line[j];
            let entity;
            switch (ch) {
            case '&':
                entities.push(makeTree(j, i));
                entities.push(makeGrass(j, i));
                break;
            case '#':
                entities.push(makeWall(j, i));
                entities.push(makeFloor(j, i));
                break;
            case '.':
                entities.push(makeFloor(j, i));
                break;
            case ' ':
                entities.push(makeGrass(j, i));
                break;
            case '@':
                entities.push(makeFloor(j, i));
                entities.push(makePlayerCharacter(j, i));
                break;
            }
        }
    }
}

class Renderer {
    constructor(canvas, numCols, numRows) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.fontSize = 16;
        this.xPadding = 20;
        this.yPadding = 0;
        this.ctx.font = `${this.fontSize}px Monospace`;
        this.cellWidth = this.ctx.measureText('@').width;
        this.cellHeight = this.fontSize;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        for (let [i, j] of this.grid.coordinates()) {
            this.grid.set(j, i, {seq: 0, entity: null, current: false});
        }
        this.seq = 0;
    }

    run(memory) {

        ++this.seq;

        this.ctx.beginPath();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let entity of memory.lastSeenTimes.keys()) {
            let lastSeenTime = memory.lastSeenTimes.get(entity);
            if (entity.hasComponents('Position', 'Tile')) {
                let vec = entity.components.Position.vec;
                let entry = this.grid.getCart(vec);

                if (entry.seq != this.seq || entry.entity == null ||
                    entry.entity.components.Tile.zIndex < entity.components.Tile.zIndex) {

                    entry.entity = entity;
                    entry.seq = this.seq;
                    entry.current = lastSeenTime == schedule.absoluteTime;
                }
            }
        }

        for (let entry of this.grid) {
            let entity = entry.entity;
            if (entity != null && entry.seq == this.seq) {
                let vec = entity.components.Position.vec;
                let colour;
                if (entry.current) {
                    colour = entity.components.Tile.colour;
                } else {
                    colour = "#444444";
                }
                this.ctx.fillStyle = colour;
                this.ctx.fillText(entity.components.Tile.character,
                              vec.x * this.cellWidth + this.yPadding,
                              vec.y * this.cellHeight + this.xPadding
                );
            }
        }

        this.ctx.fill();
    }
}

class Observation {
    constructor(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
    }
}

class Collision {
    constructor(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        for (let [i, j] of this.grid.coordinates()) {
            this.grid.set(j, i, new Set());
        }
        for (let entity of entities) {
            if (entity.hasComponent('Position') &&
                entity.hasAnyComponent('Collider', 'Solid')) {

                let vec = entity.components.Position.vec;
                this.grid.getCart(vec).add(entity);
            }
        }
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            if (action.entity.hasComponent('Collider')) {
                let toCell = this.grid.getCart(action.toCoord);
                for (let e of toCell) {
                    if (e.hasComponent('Solid')) {
                        action.fail();
                        break;
                    }
                }
            }
            break;
        }
    }

    update(action) {
        switch (action.type) {
        case ActionType.Move:
            break;
        }
    }
}

const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
}


async function getPlayerAction(entity) {
    while (true) {
        let code = await getKeyCode();
        switch (code) {
        case KeyCodes.Up:
            return new Move(entity, CardinalDirections.North);
        case KeyCodes.Down:
            return new Move(entity, CardinalDirections.South);
        case KeyCodes.Left:
            return new Move(entity, CardinalDirections.West);
        case KeyCodes.Right:
            return new Move(entity, CardinalDirections.East);
        }
    }
}

var ActionType = mkenum(
    'Move'
);

class Action {
    constructor() {
        this.success = true;
    }

    fail() {
        this.success = false;
    }

}

class Move extends Action {
    constructor(entity, direction) {
        super();
        this.entity = entity;
        this.direction = direction;
        this.fromCoord = entity.components.Position.vec.clone();
        this.toCoord = this.fromCoord.add(CardinalVectors[direction]);
    }

    get type() {
        return ActionType.Move;
    }

    commit() {
        this.entity.components.Position.vec.set(this.toCoord);
    }
}

function getPlayerCharacter() {
    for (let e of entities) {
        if (e.hasComponent('PlayerCharacter')) {
            return e;
        }
    }

    throw new Error('No player character');
}

var playerCharacter;
var schedule = new Schedule();
var renderer;
var collision;

function scheduleActorTurn(entity, relativeTime = 1) {
    schedule.scheduleTask(async function() {
        await gameStep(entity);
    }, relativeTime);
}

async function gameStep(entity) {

    for (let e of entity.components.Actor.observe(entity)) {
        entity.components.Memory.lastSeenTimes.set(e, schedule.absoluteTime);
    }

    renderer.run(entity.components.Memory);

    var action = await entity.components.Actor.getAction(entity);

    collision.check(action);

    if (action.success) {
        action.commit();
        collision.update(action);

        for (let e of entity.components.Actor.observe(entity)) {
            entity.components.Memory.lastSeenTimes.set(e, schedule.absoluteTime);
        }

        renderer.run(entity.components.Memory);
    }

    scheduleActorTurn(entity, 1);
    await mdelay(1);
}

async function gameLoop() {
    while (!schedule.empty) {
        let entry = schedule.pop();
        await entry.task();
    }
}


$(() => {(async function() {
    
    const WIDTH = 74
    const HEIGHT = 30
    renderer = new Renderer(document.getElementById('canvas'), WIDTH, HEIGHT);
    initWorld();
    playerCharacter = getPlayerCharacter();
    collision = new Collision(WIDTH, HEIGHT);
    scheduleActorTurn(playerCharacter, 0);

    await gameLoop();

})();})
