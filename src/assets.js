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
    Noteworthy,
    CombatEvent
} from './component.js';

import {
    detectVisibleArea,
    blindObserver,
    omniscientObserver
} from './observer.js';

import {
    getPlayerAction,
    getRandomMovement,
    getWait,
    moveTowardsPlayer
} from './controller.js';

import {
    jumpAbility,
    antAbility,
    beeAbility
} from './ability.js';

import * as Action from './action.js';

export function tree(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('&', 'darkgreen', null, 1),
        new Solid(),
        new Opacity(0.5),
        new Name('tree')
    ];
}

export function wall(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('#', '#222222', '#888888', 1),
        new Solid(),
        new Opacity(1),
        new Name('wall')
    ];
}

export function dirtWall(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('#', '#222222', '#7e5d0f', 1),
        new Solid(),
        new Opacity(1),
        new Name('wall')
    ];
}

export function boulder(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('*', '#888888', null, 1),
        new Opacity(0),
        new Pushable(),
        new Collider(),
        new Name('boulder')
    ];
}

export function dirt(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('.', '#493607', null, 0),
        new Opacity(0)
    ];
}

export function grass(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('.', 'darkgreen', null, 0),
        new Opacity(0)
    ];
}

export function floor(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('.', 'gray', null, 0),
        new Opacity(0)
    ];
}

export function door(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('+', '#888888', '#444444', 1),
        new Opacity(1),
        new Door(),
        new Solid(),
        new Noteworthy()
    ];
}

export function upStairs(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('<', 'gray', null, 1),
        new Opacity(0),
        new UpStairs(),
        new Noteworthy()
    ];
}

export function downStairs(x, y, level) {
    return [
        new Position(x, y, level),
        new Tile('>', 'gray', null, 1),
        new Opacity(0),
        new DownStairs(),
        new Noteworthy()
    ];
}

function character(x, y, level, health, attack, defence, accuracy, dodge, viewDistance, observer, act) {
    var components = [
        new Opacity(0),
        new Health(health),
        new Attack(attack),
        new Defence(defence),
        new Accuracy(accuracy),
        new Dodge(dodge),
        new Actor(observer, act),
        new Memory(),
        new Collider(),
        new Vision(viewDistance)
    ];
    if (x != undefined) {
        components.push(new Position(x, y, level));
    }
    return components;
}

export function antLarvae(x, y, level) {
    return character(x, y, level, 2, 0, 1, 0, 1, 0, blindObserver, getRandomMovement).concat([
        new Timeout(10, (entity, level) => {
            entity.become(antPupa(entity.x, entity.y, level));
        }, 'The ant larvae becomes a pupa.'),
        new Tile('(', 'blue', null, 2), 
        new Name('ant larvae', 'Ant Larvae'),
        new CombatNeutral(),
        new WalkTime(4),
        new Noteworthy(),
        new Getable()
    ]);
}

export function grasshopperLarvae(x, y, level) {
    return character(x, y, level, 2, 0, 1, 0, 1, 0, blindObserver, getRandomMovement).concat([
        new Timeout(20, (entity, level) => {
            entity.become(grasshopperPupa(entity.x, entity.y, level));
        }, 'The grasshopper larvae becomes a pupa.'),
        new Tile('(', 'green', null, 2), 
        new Name('grasshopper larvae', 'Gr Hppr Larvae'),
        new CombatNeutral(),
        new WalkTime(3),
        new Noteworthy(),
        new Getable()
    ]);
}

export function antPupa(x, y, level) {
    return character(x, y, level, 3, 0, 10, 0, 0, 0, blindObserver, getWait).concat([
        new Tile('[', 'blue', null, 2), 
        new Name('ant pupa', 'Ant Pupa'),
        new CombatNeutral(),
        new Noteworthy(),
        new Getable(),
        new Timeout(10, (entity, level) => {
            entity.become(ant(entity.x, entity.y, level));
        }, 'The ant pupa becomes an ant.')
    ]);
}

export function grasshopperPupa(x, y, level) {
    return character(x, y, level, 4, 0, 8, 0, 0, 0, blindObserver, getWait).concat([
        new Tile('[', 'green', null, 2), 
        new Name('grasshopper pupa', 'Gr Hppr Pupa'),
        new CombatNeutral(),
        new Noteworthy(),
        new Getable(),
        new Timeout(20, (entity, level) => {
            entity.become(grasshopper(entity.x, entity.y, level));
        }, 'The grasshopper pupa becomes a grasshopper.')
    ]);
}

export function ant(x, y, level) {
    return character(x, y, level, 4, 4, 2, 3, 2, 20, detectVisibleArea, moveTowardsPlayer).concat([
        new Tile('a', 'blue', null, 2), 
        new Name('ant', 'Ant'),
        new WalkTime(1.5),
        new Combatant(1),
        new Noteworthy(),
        new CanPush(),
        new Ability(antAbility)
    ]);
}

export function grasshopper(x, y, level) {
    return character(x, y, level, 8, 5, 1, 2, 6, 20, detectVisibleArea, moveTowardsPlayer).concat([
        new Tile('g', 'green', null, 2), 
        new Name('grasshopper', 'Grass Hppr'),
        new WalkTime(1),
        new Noteworthy(),
        new Combatant(1),
        new Ability(jumpAbility)
    ]);
}

export function beePupa(x, y, level) {
     return character(x, y, level, 3, 0, 7, 0, 0, 0, blindObserver, getWait).concat([
        new Tile('[', 'yellow', null, 2), 
        new Name('bee pupa', 'Bee Pupa'),
        new Noteworthy(),
        new Getable(),
        new CombatNeutral(),
        new Timeout(15, (entity, level) => {
            entity.become(bee(entity.x, entity.y, level));
        }, 'The bee pupa becomes a bee.')
    ]);
}

export function bee(x, y, level) {
    return character(x, y, level, 7, 2, 1, 2, 4, 20, detectVisibleArea, moveTowardsPlayer).concat([
        new Tile('b', 'yellow', null, 2), 
        new Name('bee', 'Bee'),
        new WalkTime(1),
        new Noteworthy(),
        new Combatant(1),
        new Ability(beeAbility),
        new CombatEvent((level, owner, entity, target) => {
            level.scheduleImmediateAction(new Action.ActionPair(
                new Action.Poison(target, 10, 5),
                new Action.Die(entity)
            ));
        })
    ]);
}

export function playerCharacter(x, y, level) {
    return character(x, y, level, 10, 4, 4, 4, 4, 20, detectVisibleArea, getPlayerAction).concat([
        new Tile('@', 'white', null, 4),
        new Inventory(8),
        new WalkTime(1),
        new Combatant(0),
        new Name("Player"),
        new EquipmentSlot(),
        new PlayerCharacter()
    ]);
}

export function targetDummy(x, y, level) {
    return [
        new Position(x, y, level), 
        new Tile('t', 'red', null, 3), 
        new Opacity(0),
        new Combatant(1),
        new Health(4),
        new Defence(1),
        new Dodge(1),
        new Name("target dummy"),
        new Noteworthy()
    ];
}
