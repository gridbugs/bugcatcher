import {getKey, getKeyCode, getChar} from './input.js';
import {CardinalDirections, CardinalVectors, OrdinalDirections, OrdinalVectors} from './direction.js';
import {Entity} from './entity.js';
import {detectVisibleArea} from './recursive_shadowcast.js';
import {initializeDefaultDrawer, getDefaultDrawer}  from './drawer.js';
import {
    Position,
    Tile,
    Actor,
    Solid,
    Collider,
    PlayerCharacter,
    Memory,
    Vision,
    Opacity,
    Door,
    DownStairs,
    UpStairs,
    Combatant,
    Health,
    Armour,
    Dodge,
    Accuracy,
    MeleeDamage,
    Name,
    Inventory,
    Getable
} from './component.js';

import {Level} from './level.js';

import {
    Move,
    CloseDoor,
    Descend,
    Ascend,
    Teleport,
    Walk,
    Jump,
    GetItem,
    DropItem
} from './action.js';

import {VectorChooser} from './vector_chooser.js';
import {InputCancelled} from './exception.js';

var entities = [];

var surfaceString = [
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
'&                                               &                       &', 
'&  &             &   &  &&               &              &&              &', 
'&   &      &         & &        ######################    &&&&&     &&  &', 
'&    &                          #....................#        &&&    && &', 
'&      &      ###################....................#     &          &&&', 
'&      &      #........#........#....................#           &      &', 
'& &   &       #........#........#....................#            &     &', 
'&             #........#........#..))((..............#             &    &', 
'& &           #.................#..........t.........+                  &', 
'&             #........#........#.@>.................#   &   &        & &', 
'&     #############.####........#..........t.........#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#..........t.........#                  &', 
'&     #................#........#....................#    &     & &     &', 
'&     #................#........#....................#                  &', 
'&  &  .................#........#....................#          & &     &', 
'&     #................#........#....................#      &         & &', 
'&  &  #................###############.###############      &           &', 
'&     #................#...................#                            &', 
'&     #................#...................#               &   &     &  &', 
'&     ##################...................#            % %%%%          &', 
'&                      #...................#          & %,,,,%          &', 
'&   & &  &             #....................      &     %,,,,% &    &   &', 
'&         &            #...................#       &  & %%%%%%      &   &', 
'&    &&  & &        &  #...................#        &       &           &', 
'&     &    &        &  #...................#                  &     &   &', 
'&      &    &&&        #####################                        &   &', 
'&                                                                       &', 
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
];

var dungeonString = [
'%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
'%%%%%%,,,,,,,,,,,,,,,,,,,,,,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%,,,,,,,,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,,,,,,,,,,,,,,,,,,,,,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,,,,,,,,,,,<,,,,,,,,,,,%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%&%,%%%%%%%%%%,%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%&%,%%%%%%%%%%,%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%&%,%%%%%%%%%%,%%%%%%%%,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%,%%%%%%,%%',
'%%%%%%,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%,%%%%%%%%%%%%%%%,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,,,,,,,,,,,,,,,,,,,,,,,,,,,,%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
'%%%%%%,%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
'%%%%%%,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
'%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
];


var surfaceLevel;
var dungeonLevel;

function makeTree(x, y) {
    return new Entity(new Position(x, y), new Tile('&', 'green', null, 1), new Solid(), new Opacity(0.5));
}
function makeWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', '#222222', '#888888', 1), new Solid(), new Opacity(1));
}
function makeDirtWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', '#222222', '#7e5d0f', 1), new Solid(), new Opacity(1));
}
function makeDirt(x, y) {
    return new Entity(new Position(x, y), new Tile('.', '#493607', null, 0), new Opacity(0));
}
function makeGrass(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'darkgreen', null, 0), new Opacity(0));
}
function makeFloor(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'gray', null, 0), new Opacity(0));
}
function makeDoor(x, y) {
    return new Entity(new Position(x, y), new Tile('+', '#888888', '#444444', 1), new Opacity(1), new Door(), new Solid());
}
function makeUpStairs(x, y) {
    return new Entity(new Position(x, y), new Tile('<', 'gray', null, 1), new Opacity(0), new UpStairs());
}
function makeDownStairs(x, y) {
    return new Entity(new Position(x, y), new Tile('>', 'gray', null, 1), new Opacity(0), new DownStairs());
}

function makeWorkerAntLarvae(x, y) {
    return new Entity(new Position(x, y), new Tile('(', 'blue', null, 2), new Opacity(0), new Getable(), new Name('worker ant larvae', 'Wo Ant Larvae'));
}

function makeGrasshopperLarvae(x, y) {
    return new Entity(new Position(x, y), new Tile('(', 'green', null, 2), new Opacity(0), new Getable(), new Name('grasshopper larvae', 'Gr Hppr Larvae'));
}


function makeTargetDummy(x, y) {
    return new Entity(  new Position(x, y), 
                        new Tile('t', 'red', null, 3), 
                        new Opacity(0),
                        new Combatant(),
                        new Health(4),
                        new Armour(1),
                        new Dodge(1),
                        new Name("target dummy")
                    );
}

function makePlayerCharacter(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('@', 'white', null, 4),
                        new Actor(detectVisibleArea, getPlayerAction),
                        new PlayerCharacter(),
                        new Collider(),
                        new Memory(),
                        new Vision(20),
                        new Opacity(0.2),
                        new Combatant(),
                        new Accuracy(2),
                        new MeleeDamage(2),
                        new Health(10),
                        new Armour(1),
                        new Inventory(8)
                    );
}

function initWorld(str) {
    var entities = [];
    for (let i = 0; i < str.length; ++i) {
        let line = str[i];
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
            case '+':
                entities.push(makeDoor(j, i));
                entities.push(makeFloor(j, i));
                break;
            case '.':
                entities.push(makeFloor(j, i));
                break;
            case ' ':
                entities.push(makeGrass(j, i));
                break;
            case ',':
                entities.push(makeDirt(j, i));
                break;
            case '@':
                entities.push(makeFloor(j, i));
                entities.push(makePlayerCharacter(j, i));
                break;
            case 't':
                entities.push(makeFloor(j, i));
                entities.push(makeTargetDummy(j, i));
                break;
            case '(':
                entities.push(makeFloor(j, i));
                entities.push(makeWorkerAntLarvae(j, i));
                break;
            case ')':
                entities.push(makeFloor(j, i));
                entities.push(makeGrasshopperLarvae(j, i));
                break;
            case '%':
                entities.push(makeDirtWall(j, i));
                entities.push(makeDirt(j, i));
                break;
            case '>':
                entities.push(makeDownStairs(j, i));
                break;
            case '<':
                entities.push(makeUpStairs(j, i));
                break;
            }
        }
    }
    return entities;
}



const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Close: 67,
    DownStairs: 190,
    UpStairs: 188,
    Teleport: 65,
    Jump: 66,
    Get: 71,
    Drop: 68
}


function closeDoor(level, entity) {
    for (let cell of level.entitySpacialHash.iterateNeighbours(entity.Position.coordinates)) {
        for (let e of cell) {
            if (e.hasComponent(Door) && e.Door.open) {
                return new CloseDoor(entity, e);
            }
        }
    }
    return null;
}

function ascendStairs(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(UpStairs)) {
            return new Ascend(entity, e);
        }
    }
}
function descendStairs(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(DownStairs)) {
            return new Descend(entity, e);
        }
    }
}

function getItem(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(Getable)) {
            return new GetItem(entity, e);
        }
    }
}

async function dropItem(level, entity) {
    level.descriptionSystem.printMessage("Drop from which slot (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item != null) {
            return new DropItem(entity, index);
        } else {
            level.descriptionSystem.printMessage(`No item in slot ${index}.`);
        }
    } else {
        level.descriptionSystem.printMessage("Ignoring");
    }
}

var teleportChooser, jumpChooser, playerCharacter;

function canSee(entity, vector) {
    var level = entity.Position.level;
    var memoryCell = entity.Memory.value.getCart(level, vector);
    for (let memoryEntry of memoryCell) {
        if (memoryEntry.turn == level.turn) {
            return true;
        }
    }
    return false;
}

async function getPlayerAction(level, entity) {
    while (true) {
        var code = await getKeyCode();
        switch (code) {
        case KeyCodes.Up:
            return new Walk(entity, CardinalDirections.North);
        case KeyCodes.Down:
            return new Walk(entity, CardinalDirections.South);
        case KeyCodes.Left:
            return new Walk(entity, CardinalDirections.West);
        case KeyCodes.Right:
            return new Walk(entity, CardinalDirections.East);
        case KeyCodes.Close:
            var action = closeDoor(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.DownStairs:
            var action = descendStairs(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.UpStairs:
            var action = ascendStairs(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Teleport:
            try {
                var vector = await teleportChooser.getVector(playerCharacter.Position.coordinates, playerCharacter);
                if (canSee(playerCharacter, vector)) {
                    return new Teleport(entity, vector);
                }
            } catch (e) {
                if (e instanceof InputCancelled) {
                    break;
                }
                throw e;
            }
            break;
        case KeyCodes.Jump:
            try {
                var path = await jumpChooser.getPath(playerCharacter.Position.coordinates, playerCharacter);
                return new Jump(entity, path);
            } catch (e) {
                if (e instanceof InputCancelled) {
                    break;
                }
                throw e;
            }
            break;
        case KeyCodes.Get:
            var action = getItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Drop:
            var action = await dropItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        }
    }
}

function getPlayerCharacter(entities) {
    for (let e of entities) {
        if (e.hasComponent(PlayerCharacter)) {
            return e;
        }
    }

    throw new Error('No player character');
}

async function gameLoop(playerCharacter) {
    while (true) {
        await playerCharacter.Position.level.progressSchedule();
    }
}

$(() => {(async function() {
 
    const WIDTH = 74
    const HEIGHT = 30
    
    initializeDefaultDrawer(WIDTH, HEIGHT, document.getElementById("canvas"));

    surfaceLevel = new Level(WIDTH, HEIGHT, initWorld(surfaceString));
    dungeonLevel = new Level(WIDTH, HEIGHT, initWorld(dungeonString));

    var transparent = 'rgba(0, 0, 0, 0)';
    var lightYellow = 'rgba(255, 255, 0, 0.25)';
    var yellow = 'rgba(255, 255, 0, 1)';
    teleportChooser = new VectorChooser(yellow, true, transparent, transparent, true, transparent, true);
    jumpChooser = new VectorChooser(yellow, true, lightYellow, transparent, true, transparent, true);

    (() => {
        var upStairs, downStairs;
        for (let entity of dungeonLevel.entities) {
            if (entity.hasComponent(UpStairs)) {
                upStairs = entity;
            }
        }
        for (let entity of surfaceLevel.entities) {
            if (entity.hasComponent(DownStairs)) {
                downStairs = entity;
            }
        }

        upStairs.UpStairs.level = surfaceLevel;
        upStairs.UpStairs.coordinates = downStairs.Position.coordinates.clone();

        downStairs.DownStairs.level = dungeonLevel;
        downStairs.DownStairs.coordinates = upStairs.Position.coordinates.clone();

        for (let e of surfaceLevel.entities) {
            if (e.hasComponent(Position)) {
                e.Position.level = surfaceLevel;
                e.Position.addToSpacialHash();
            }
        }

    })();
    
    playerCharacter = getPlayerCharacter(surfaceLevel.entities);

    surfaceLevel.scheduleActorTurn(playerCharacter, 0);

    surfaceLevel.setPlayerCharacter(playerCharacter);
    dungeonLevel.setPlayerCharacter(playerCharacter);

    await gameLoop(playerCharacter);

})();})
