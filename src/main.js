import {AvlTree} from './avl_tree.js';
import {Vec2} from './vec2.js';
import {Grid} from './grid.js';
import {getKey, getKeyCode} from './input.js';
import {mdelay} from './time.js';
import {mkenum, mknametable, tableIterator} from './util.js';
import {CardinalDirections, CardinalVectors, OrdinalDirections, OrdinalVectors} from './direction.js';
import {Schedule} from './schedule.js';
import {Entity, EntityMap} from './entity.js';
import {SpacialHash, AggregateSpacialHash} from './spacial_hash.js';
import {detectVisibleArea} from './recursive_shadowcast.js';
import {
    Position,
    Tile,
    Actor,
    Solid,
    Collider,
    PlayerCharacter,
    Memory,
    Vision,
    Opacity
} from './component.js';

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
'&             #........#........#.@..................#   &   &        & &', 
'&     #############.####........#....................#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#....................#                  &', 
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

var emptyWorld = [
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                    @                                                  &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&                                                                       &', 
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 

];

function makeTree(x, y) {
    return new Entity(new Position(x, y), new Tile('&', 'green', 1), new Solid(), new Opacity(0.5));
}
function makeWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', 'gray', 1), new Solid(), new Opacity(1));
}
function makeGrass(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'darkgreen', 0), new Opacity(0));
}
function makeFloor(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'gray', 0), new Opacity(0));
}
function makePlayerCharacter(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('@', 'white', 2),
                        new Actor(detectVisibleArea, getPlayerAction),
                        new PlayerCharacter(),
                        new Collider(),
                        new Memory(),
                        new Vision(20),
                        new Opacity(0.2)
                    );
}

function* observeCircle(eyePosition, viewDistance, grid) {
    var viewDistanceSquared = viewDistance * viewDistance;
    for (let entity of entities) {
        if (entity.hasComponent(Position)) {
            var entityPosition = entity.Position.vec;
            var distanceSquared = eyePosition.getDistanceSquared(entityPosition);
            if (distanceSquared <= viewDistanceSquared) {
                yield entity;
            }
        }
    }
}

function* observeSquare(eyePosition, viewDistance, grid) {
    for (let i = Math.max(eyePosition.y-viewDistance, 0); i <= Math.min(eyePosition.y+viewDistance, grid.height - 1); ++i) {
        for (let j = Math.max(eyePosition.x-viewDistance, 0); j <= Math.min(eyePosition.x+viewDistance, grid.width - 1); ++j) {
            let cell = grid.get(j, i);
            yield* cell.keys();
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

    run(entity) {

        var memory = entity.Memory;

        ++this.seq;

        this.ctx.beginPath();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let entity of memory.lastSeenTimes.keys()) {
            let lastSeenTime = memory.lastSeenTimes.get(entity);
            if (entity.hasComponents(Position, Tile)) {
                let vec = entity.Position.vec;
                let entry = this.grid.getCart(vec);

                if (entry.seq != this.seq || entry.entity == null ||
                    entry.entity.Tile.zIndex < entity.Tile.zIndex) {

                    entry.entity = entity;
                    entry.seq = this.seq;
                    entry.current = lastSeenTime == schedule.absoluteTime;
                }
            }
        }

        for (let entry of this.grid) {
            let entity = entry.entity;
            if (entity != null && entry.seq == this.seq) {
                let vec = entity.Position.vec;
                let colour;
                if (entry.current) {
                    colour = entity.Tile.colour;
                } else {
                    colour = "#444444";
                }
                this.ctx.fillStyle = colour;
                this.ctx.fillText(entity.Tile.character,
                              vec.x * this.cellWidth + this.yPadding,
                              vec.y * this.cellHeight + this.xPadding
                );
            }
        }

        this.ctx.fill();
    }
}

class ObservationEntityMap extends EntityMap {
    constructor(x, y) {
        super();
        this.coordinate = new Vec2(x, y);
        this.centre = new Vec2(x + 0.5, y + 0.5);
        this.corners = new Array(4);
        for (let [direction, vector] of tableIterator(OrdinalDirections, OrdinalVectors)) {
            this.corners[direction] = this.centre.add(vector.divide(2));
        }
        this.maxOpacity = 0;
    }

    updateAggregate() {
        var maxOpacity = 0;
        for (let opacity of this.values()) {
            maxOpacity = Math.max(maxOpacity, opacity);
        }
        this.maxOpacity =  maxOpacity;
    }

    get opacity() {
        return this.maxOpacity;
    }

    see(entity) {
        for (let e of this.keys()) {
            entity.Memory.lastSeenTimes.set(e, schedule.absoluteTime);
        }
    }
}

class Observation {
    constructor(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new AggregateSpacialHash(this.numCols, this.numRows, ObservationEntityMap).initialize(
            entities,
            (e) => {return e.hasComponents(Position, Opacity)},
            (e) => {
                return e.Opacity.value
            }
        );
    }

    run(entity) {
        var visionDistance = entity.Vision.distance;
        var eyePosition = entity.Position.vec;
        entity.Actor.observe(entity, eyePosition, visionDistance, this.grid);
    }

    update(action) {
        switch (action.type) {
        case ActionType.Move:
            this.grid.updateOnMoveAction(action);
            break;
        }
    }
}

class Collision {
    constructor(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new SpacialHash(this.numCols, this.numRows, EntityMap).initialize(
            entities,
            (e) => {
                return e.hasComponent(Position) &&
                    e.hasAnyComponent(Collider, Solid)
            }
        );
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            if (action.entity.hasComponent(Collider)) {
                let toCell = this.grid.getCart(action.toCoord);
                for (let e of toCell.keys()) {
                    if (e.hasComponent(Solid)) {
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
            this.grid.updateOnMoveAction(action);
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
        var code = await getKeyCode();
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
        this.fromCoord = entity.Position.vec.clone();
        this.toCoord = this.fromCoord.add(CardinalVectors[direction]);
    }

    get type() {
        return ActionType.Move;
    }

    commit() {
        this.entity.Position.vec.set(this.toCoord);
    }
}

function getPlayerCharacter() {
    for (let e of entities) {
        if (e.hasComponent(PlayerCharacter)) {
            return e;
        }
    }

    throw new Error('No player character');
}

var playerCharacter;
var schedule = new Schedule();
var renderer;
var collision;
var observation;

function scheduleActorTurn(entity, relativeTime = 1) {
    schedule.scheduleTask(async function() {
        await gameStep(entity);
    }, relativeTime);
}

async function gameStep(entity) {

    observation.run(entity);
    renderer.run(entity);

    var action = await entity.Actor.getAction(entity);

    collision.check(action);

    if (action.success) {
        action.commit();

        collision.update(action);
        observation.update(action);

        observation.run(entity);
        renderer.run(entity);
    }

    scheduleActorTurn(entity, 1);
    await mdelay(1);
}

async function gameLoop() {
    while (!schedule.empty) {
        var entry = schedule.pop();
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
    observation = new Observation(WIDTH, HEIGHT);
    scheduleActorTurn(playerCharacter, 0);

    await gameLoop();

})();})
