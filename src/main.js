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
    Timeout
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
import {InputCancelled, NoAction} from './exception.js';

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
'&             #........#........#.@>.ag..............#   &   &        & &', 
'&     #############.####........#....a.....t.........#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#.***......t.........#                  &', 
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

function makeTree(x, y) {
    return new Entity(new Position(x, y), new Tile('&', 'green', null, 1), new Solid(), new Opacity(0.5), new Name('tree'));
}
function makeWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', '#222222', '#888888', 1), new Solid(), new Opacity(1), new Name('wall'));
}
function makeDirtWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', '#222222', '#7e5d0f', 1), new Solid(), new Opacity(1), new Name('wall'));
}
function makeBoulder(x, y) {
    return new Entity(new Position(x, y), new Tile('*', '#888888', null, 1), new Opacity(0.5), new Pushable(), new Collider(), new Name('boulder'));
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
}

function makeAntLarvae(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('(', 'blue', null, 2), 
                        new Opacity(0),
                        new Getable(),
                        new Name('ant larvae', 'Ant Larvae'),
                        new Health(2),
                        new Defence(1),
                        new Attack(0),
                        new Dodge(1),
                        new Accuracy(0),
                        new Timeout(20, (entity) => {
                            becomePupa(entity, 3, 0, 10, 0, 0, 'ant pupa', 'Ant Pupa')
                        }, 'The ant larvae becomes a pupa.')
                    );
}

function makeGrasshopperLarvae(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('(', 'green', null, 2),
                        new Opacity(0),
                        new Getable(),
                        new Name('grasshopper larvae', 'Gr Hppr Larvae'),
                        new Health(2),
                        new Defence(1),
                        new Attack(0),
                        new Dodge(1),
                        new Accuracy(0)
                    );
}

function makeGrasshopper(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('g', 'green', null, 2), 
                        new Opacity(0), 
                        new Getable(), 
                        new Name('grasshopper', 'Grass Hopper'),
                        new Ability(jumpAbility),
                        new Health(8),
                        new Defence(1),
                        new Attack(5),
                        new Dodge(6),
                        new Accuracy(2)
                    );
}
function makeAnt(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('a', 'blue', null, 2), 
                        new Opacity(0), 
                        new Getable(), 
                        new Name('ant', 'Ant'),
                        new Ability(antAbility),
                        new Health(4),
                        new Defence(2),
                        new Attack(4),
                        new Dodge(2),
                        new Accuracy(3)
                    );
}

function makeTargetDummy(x, y) {
    return new Entity(  new Position(x, y), 
                        new Tile('t', 'red', null, 3), 
                        new Opacity(0),
                        new Combatant(),
                        new Health(4),
                        new Defence(1),
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
                        new Attack(2),
                        new Health(11),
                        new Defence(1),
                        new Dodge(2),
                        new Inventory(8),
                        new Name("Player"),
                        new EquipmentSlot()
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



const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Close: 67,
    DownStairs: 190,
    UpStairs: 188,
    Ability: 65,
    Jump: 66,
    Get: 71,
    Drop: 68,
    Wait: 190,
    Equip: 69,
    Unequip: 82
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

async function equipItem(level, entity) {
    level.descriptionSystem.printMessage("Channel from which slot (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item != null) {
            return new EquipItem(entity, item);
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

async function useAbility(level, entity) {
    level.descriptionSystem.printMessage("Which ability (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item == null) {
            level.descriptionSystem.printMessage(`Slot ${index} is empty.`);
        } else if (!item.hasComponent(Ability)) {
            level.descriptionSystem.printMessage(`The ${item.Name.fullName} has no ability.`);
        } else if (item.hasComponent(Cooldown)) {
            level.print('This item is cooling down.');
        } else {
            var action = await item.Ability.getAction(level, entity);
            if (entity.EquipmentSlot.item == item) {
                return new ActionPair(new UnequipItem(entity), action);
            } else {
                return action;
            }
        }
    } else {
        level.descriptionSystem.printMessage("Ignoring");
    }
}

async function jumpAbility(level, entity) {
    try {
        if (this.entity.hasComponent(Name)) {
            level.print(`[${this.entity.Name.fullName}] Jump to where?`);
        }
        var path = await jumpChooser.getPath(playerCharacter.Position.coordinates, playerCharacter);
        return new ActionPair(new Jump(entity, path), new EnterCooldown(this.entity, 2+Math.floor(path.length/2)));
    } catch (e) {
        return null;
    }
}

async function antAbility(level, entity) {
    return new ActionPair(new CallFunction(() => {
        entity.addComponent(new CanPush().makeTemporary(11, 'Your ant-like strength subsides.').setDisplayable('Ant-like Strength'));
    }, entity, `[${this.entity.Name.fullName}] You gain ant-like strength.`), new EnterCooldown(this.entity, 15));
}

async function getPlayerAction(level, entity) {
    while (true) {
        var key = await getKey();
        switch (key.keyCode) {
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
        case KeyCodes.Wait:
            if (key.shiftKey) {
                var action = descendStairs(level, entity);
                if (action != null) {
                    return action;
                }
            } else {
                return new Wait(entity);
            }
            break;
        case KeyCodes.UpStairs:
            if (key.shiftKey) {
                var action = ascendStairs(level, entity);
                if (action != null) {
                    return action;
                }
            }
            break;
        case KeyCodes.Ability:
            var action = await useAbility(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Jump:
            var action = await jumpAbility(level, entity);
            if (action != null) {
                return action;
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
        case KeyCodes.Equip:
            var action = await equipItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Unequip:
            if (entity.EquipmentSlot.item != null) {
                return new UnequipItem(entity);
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

    
        playerCharacter = getPlayerCharacter(surfaceLevel.entities);

        surfaceLevel.scheduleActorTurn(playerCharacter, 0);

        surfaceLevel.setPlayerCharacter(playerCharacter);
        dungeonLevel.setPlayerCharacter(playerCharacter);

        for (let level of [surfaceLevel, dungeonLevel]) {
            level.registerPeriodicFunction(processTimeouts, 1);
        }

    })();

    await gameLoop(playerCharacter);

})();})
