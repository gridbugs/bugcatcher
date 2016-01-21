import {getKey, getKeyCode, getChar} from './input.js';
import {arrayRandom} from './util.js';
import {CardinalDirections, CardinalDirectionVectors, OrdinalDirections, OrdinalDirectionVectors, Directions} from './direction.js';
import {Entity} from './entity.js';
import {detectVisibleArea} from './recursive_shadowcast.js';
import {initializeDefaultDrawer, getDefaultDrawer}  from './drawer.js';
import {shortestPathThroughGrid, shortestPathThroughGridUntilPredicate} from './search.js';
import {Vec2} from './vec2.js';
import {getPlayerAction} from './player_controller.js';
import {jumpAbility, antAbility} from './ability.js';
import * as Config from './config.js';
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
    Defence,
    Dodge,
    Accuracy,
    Attack,
    Name,
    Inventory,
    Getable,
    Ability,
    Pushable,
    CanPush,
    Cooldown,
    EquipmentSlot,
    Timeout,
    WalkTime,
    CombatNeutral,
    Noteworthy
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
    DropItem,
    CallFunction,
    Wait,
    EnterCooldown,
    EquipItem,
    UnequipItem,
    ActionPair
} from './action.js';

import {
    EnterComponentCooldown 
} from './engine_action.js';

import {VectorChooser} from './vector_chooser.js';
import {InputCancelled, NoAction, NoResults} from './exception.js';

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
'&             #........#........#....................#             &    &', 
'& &           #.................#....................+                  &', 
'&             #........#........#..>.................#   &   &        & &', 
'&     #############.####........#......()............#             &    &', 
'&     #................#......@.....ag...............#           &      &', 
'&   & #.........................#.***................#                  &', 
'&     #................#........#...*................#    &     & &     &', 
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

function getRandomMovement(level, entity) {
    return new Walk(entity, arrayRandom([Directions.North, Directions.East, Directions.South, Directions.West]));
}
function blindObserver(eyePosition, viewDistance, grid) {
}
function getWait(level, entity) {
    return new Wait(entity);
}

function shortestPathThroughGridUntilPredicateCardinal(grid, start, predicate, canEnterPredicate) {
    return shortestPathThroughGridUntilPredicate(grid, start, predicate, canEnterPredicate,
                                [Directions.North, Directions.East, Directions.South, Directions.West],
                                () => {return 1;});
}

function shortestPathThroughGridCardinal(grid, start, end, canEnterPredicate) {
    return shortestPathThroughGrid(grid, start, end, canEnterPredicate,
                                [Directions.North, Directions.East, Directions.South, Directions.West],
                                () => {return 1;},
                                (current, destination) => {
                                    return current.getManhattenDistance(destination);
                                });
}

function moveTowardsPlayer(level, entity) {
    var grid = entity.Memory.value.getSpacialHash(level);
    var canEnter = (entities) => {
        for (let e of entities) {
            if (e.hasComponent(Solid)) {
                return false;
            }
        }
        return true;
    };
    try {
        let path = shortestPathThroughGridUntilPredicateCardinal(
            grid,
            entity.Position.coordinates,
            (entities) => {
                for (let e of entities) {
                    if (e.hasComponent(PlayerCharacter)) {
                        return true;
                    }
                }
                return false;
            },
            canEnter
        );
        entity.Actor.lastPlayerPosition = path.end;
        if (path.directions.length == 0) {
            return new Wait(entity);
        }
        return new Walk(entity, path.directions[0]);
    } catch (e) {
        if (e instanceof NoResults) {
            if (entity.Actor.lastPlayerPosition != null) {
                try {
                    let path = shortestPathThroughGridCardinal(
                        grid,
                        entity.Position.coordinates,
                        entity.Actor.lastPlayerPosition,
                        canEnter
                    );
                    if (path.directions.length == 0) {
                        this.lastPlayerPosition = null;
                        return new Wait(entity);
                    }
                    return new Walk(entity, path.directions[0]);
                } catch (e) {
                    if (e instanceof NoResults) {
                        return getRandomMovement(level, entity);
                    } else {
                        throw e;
                    }
                }
            }
        } else {
            throw e;
        }
    }

    return new Wait(entity);
}

function makeTree(x, y) {
    return new Entity([new Position(x, y), new Tile('&', 'green', null, 1), new Solid(), new Opacity(0.5), new Name('tree')]);
}
function makeWall(x, y) {
    return new Entity([new Position(x, y), new Tile('#', '#222222', '#888888', 1), new Solid(), new Opacity(1), new Name('wall')]);
}
function makeDirtWall(x, y) {
    return new Entity([new Position(x, y), new Tile('#', '#222222', '#7e5d0f', 1), new Solid(), new Opacity(1), new Name('wall')]);
}
function makeBoulder(x, y) {
    return new Entity([new Position(x, y), new Tile('*', '#888888', null, 1), new Opacity(0), new Pushable(), new Collider(), new Name('boulder')]);
}
function makeDirt(x, y) {
    return new Entity([new Position(x, y), new Tile('.', '#493607', null, 0), new Opacity(0)]);
}
function makeGrass(x, y) {
    return new Entity([new Position(x, y), new Tile('.', 'darkgreen', null, 0), new Opacity(0)]);
}
function makeFloor(x, y) {
    return new Entity([new Position(x, y), new Tile('.', 'gray', null, 0), new Opacity(0)]);
}
function makeDoor(x, y) {
    return new Entity([new Position(x, y), new Tile('+', '#888888', '#444444', 1), new Opacity(1), new Door(), new Solid(), new Noteworthy()]);
}
function makeUpStairs(x, y) {
    return new Entity([new Position(x, y), new Tile('<', 'gray', null, 1), new Opacity(0), new UpStairs(), new Noteworthy()]);
}
function makeDownStairs(x, y) {
    return new Entity([new Position(x, y), new Tile('>', 'gray', null, 1), new Opacity(0), new DownStairs(), new Noteworthy()]);
}

function becomePupa(entity, health, attack, defence, accuracy, dodge, fullName, shortName=fullName) {
    entity.Health.value = health;
    entity.Health.maxValue = health;
    entity.Attack.value = attack;
    entity.Defence.value = defence;
    entity.Accuracy.value = accuracy;
    entity.Dodge.value = dodge;
    entity.Name.fullName = fullName;
    entity.Name.shortName = shortName;
    entity.Tile.character = '[';
    entity.Actor.getAction = getWait;
}

function makeAntLarvae(x, y) {
    return new Entity([ new Position(x, y),
                        new Tile('(', 'blue', null, 2), 
                        new Opacity(0),
                        new Getable(),
                        new Name('ant larvae', 'Ant Larvae'),
                        new Health(2),
                        new Defence(1),
                        new Attack(0),
                        new Dodge(1),
                        new Accuracy(0),
                        new Actor(blindObserver, getRandomMovement),
                        new Memory(),
                        new Collider(),
                        new WalkTime(4),
                        new CombatNeutral(),
                        new Timeout(20, (entity) => {
                            becomePupa(entity, 3, 0, 10, 0, 0, 'ant pupa', 'Ant Pupa')
                        }, 'The ant larvae becomes a pupa.'),
                        new Noteworthy()
                    ]);
}

function makeGrasshopperLarvae(x, y) {
    return new Entity([ new Position(x, y),
                        new Tile('(', 'green', null, 2),
                        new Opacity(0),
                        new Getable(),
                        new Name('grasshopper larvae', 'Gr Hppr Larvae'),
                        new Health(2),
                        new Defence(1),
                        new Attack(0),
                        new Dodge(1),
                        new Accuracy(0),
                        new Noteworthy(),
                        new Actor(blindObserver, getRandomMovement),
                        new Memory(),
                        new Collider(),
                        new WalkTime(3),
                        new CombatNeutral(),
                        new Timeout(20, (entity) => {
                            becomePupa(entity, 4, 0, 8, 0, 0, 'grasshopper pupa', 'Gr Hppr Pupa')
                        }, 'The grasshopper larvae becomes a pupa.')
                    ]);
}

function makeGrasshopper(x, y) {
    return new Entity([ new Position(x, y),
                        new Tile('g', 'green', null, 2), 
                        new Opacity(0), 
                        new Getable(), 
                        new Name('grasshopper', 'Grass Hopper'),
                        new Ability(jumpAbility),
                        new Health(8),
                        new Defence(1),
                        new Attack(5),
                        new Dodge(6),
                        new Accuracy(2),
                        new Noteworthy()
                        /*
                        new Actor(blindObserver, getRandomMovement),
                        new Memory(),
                        new Collider(),
                        new WalkTime(3),
                        new Combatant(1)
                        */
                    ]);
}
function makeAnt(x, y) {
    return new Entity([ new Position(x, y),
                        new Tile('a', 'blue', null, 2), 
                        new Opacity(0), 
                        new Getable(), 
                        new Name('ant', 'Ant'),
                        new Ability(antAbility),
                        new Health(4),
                        new Defence(2),
                        new Attack(4),
                        new Dodge(2),
                        new Accuracy(3),
                        new Noteworthy()
                        /*
                        new Actor(detectVisibleArea, moveTowardsPlayer),
                        new Vision(20),
                        new Memory(),
                        new Collider(),
                        new WalkTime(1.5),
                        new Combatant(1),
                        new CanPush()
                        */
                    ]);
}

function makeTargetDummy(x, y) {
    return new Entity([ new Position(x, y), 
                        new Tile('t', 'red', null, 3), 
                        new Opacity(0),
                        new Combatant(1),
                        new Health(4),
                        new Defence(1),
                        new Dodge(1),
                        new Name("target dummy"),
                        new Noteworthy()
                    ]);
}

function makePlayerCharacter(x, y) {
    return new Entity([ new Position(x, y),
                        new Tile('@', 'white', null, 4),
                        new Actor(detectVisibleArea, getPlayerAction),
                        new PlayerCharacter(),
                        new Collider(),
                        new Memory(),
                        new Vision(20),
                        new Opacity(0.2),
                        new Combatant(0),
                        new Accuracy(2),
                        new Attack(2),
                        new Health(11),
                        new Defence(1),
                        new Dodge(2),
                        new Inventory(8),
                        new WalkTime(1),
                        new Name("Player"),
                        new EquipmentSlot()
                    ]);
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
            case '*':
                entities.push(makeFloor(j, i));
                entities.push(makeBoulder(j, i));
                break;
            case 't':
                entities.push(makeFloor(j, i));
                entities.push(makeTargetDummy(j, i));
                break;
            case '(':
                entities.push(makeFloor(j, i));
                entities.push(makeAntLarvae(j, i));
                break;
            case ')':
                entities.push(makeFloor(j, i));
                entities.push(makeGrasshopperLarvae(j, i));
                break;
            case 'g':
                entities.push(makeFloor(j, i));
                entities.push(makeGrasshopper(j, i));
                break;
            case 'a':
                entities.push(makeFloor(j, i));
                entities.push(makeAnt(j, i));
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

var playerCharacter;

function getPlayerCharacter(entities) {
    for (let e of entities) {
        if (e.hasComponent(PlayerCharacter)) {
            return e;
        }
    }

    throw new Error('No player character');
}

async function gameLoop(playerCharacter) {
    var level = playerCharacter.Position.level;
    while (true) {
        await level.progressSchedule();
        if (!playerCharacter.Actor.active) {
            break;
        }
    }
    level.observationSystem.run(playerCharacter);
    level.rendererSystem.run(playerCharacter);
    level.hudSystem.run(playerCharacter);
}

function processEntityTimeouts(entities, level) {
    for (let entity of entities) {
        if (entity.hasComponent(Timeout)) {
            entity.Timeout.progress(level);
        }
        if (entity.hasComponent(Inventory)) {
            processEntityTimeouts(entity.Inventory.inventory.contents(), level);
        }
    }
}

function processTimeouts(level) {
    processEntityTimeouts(level.entities, level);
    return true;
}

$(() => {(async function() {
 
    initializeDefaultDrawer(Config.WIDTH, Config.HEIGHT, document.getElementById(Config.CANVAS_NAME));

    surfaceLevel = new Level(Config.WIDTH, Config.HEIGHT, initWorld(surfaceString));
    dungeonLevel = new Level(Config.WIDTH, Config.HEIGHT, initWorld(dungeonString));

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
            if (e.hasComponent(Actor)) {
                e.Actor.enable(surfaceLevel);
            }
        }

        playerCharacter = getPlayerCharacter(surfaceLevel.entities);

        surfaceLevel.setPlayerCharacter(playerCharacter);
        dungeonLevel.setPlayerCharacter(playerCharacter);

        for (let level of [surfaceLevel, dungeonLevel]) {
            level.registerPeriodicFunction(processTimeouts, 1);
        }

    })();

    await gameLoop(playerCharacter);

})();})
