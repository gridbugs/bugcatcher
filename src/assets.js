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

import {
    detectVisibleArea,
    blindObserver
} from './observer.js';

export function tree(x, y) {
    return [
        new Position(x, y),
        new Tile('&', 'green', null, 1),
        new Solid(),
        new Opacity(0.5),
        new Name('tree')
    ];
}

export function wall(x, y) {
    return [
        new Position(x, y),
        new Tile('#', '#222222', '#888888', 1),
        new Solid(),
        new Opacity(1),
        new Name('wall')
    ];
}

export function dirtWall(x, y) {
    return [
        new Position(x, y),
        new Tile('#', '#222222', '#7e5d0f', 1),
        new Solid(),
        new Opacity(1),
        new Name('wall')
    ];
}

export function boulder(x, y) {
    return [
        new Position(x, y),
        new Tile('*', '#888888', null, 1),
        new Opacity(0),
        new Pushable(),
        new Collider(),
        new Name('boulder')
    ];
}

export function dirt(x, y) {
    return [
        new Position(x, y),
        new Tile('.', '#493607', null, 0),
        new Opacity(0)
    ];
}

export function grass(x, y) {
    return [
        new Position(x, y),
        new Tile('.', 'darkgreen', null, 0),
        new Opacity(0)
    ];
}

export function floor(x, y) {
    return [
        new Position(x, y),
        new Tile('.', 'gray', null, 0),
        new Opacity(0)
    ];
}

export function door(x, y) {
    return [
        new Position(x, y),
        new Tile('+', '#888888', '#444444', 1),
        new Opacity(1),
        new Door(),
        new Solid(),
        new Noteworthy()
    ];
}

export function upStairs(x, y) {
    return [
        new Position(x, y),
        new Tile('<', 'gray', null, 1),
        new Opacity(0),
        new UpStairs(),
        new Noteworthy()
    ];
}

export function downStairs(x, y) {
    return [
        new Position(x, y),
        new Tile('>', 'gray', null, 1),
        new Opacity(0),
        new DownStairs(),
        new Noteworthy()
    ];
}

function character(x, y, health, attack, defence, accuracy, dodge, viewDistance, walkTime, obserer, act) {
    return [
        new Position(x, y),
        new Opacity(0),
        new Health(health),
        new Attack(attack),
        new Defence(defence),
        new Accuracy(accuracy),
        new Dodge(dodge),
        new Actor(observer, act),
        new Memory(),
        new Collider(),
        new Noteworthy(),
        new Vision(viewDistance)
    ];
}

export function antLarvae(x, y) {
    return character(x, y, 2, 0, 1, 0, 1, 0, blindObserver, getRandomMovement).concat([
        new Timeout(20, (entity) => {
            entity.become(antPupa(entity.Position.x, entity.Position.y));
        }, 'The ant larvae becomes a pupa.'),
        new Tile('(', 'blue', null, 2), 
        new Name('ant larvae', 'Ant Larvae'),
        new CombatNeutral(),
        new WalkTime(4),
        new Getable()
    ]);
}

export function grasshopperLarvae(x, y) {
    return character(x, y, 2, 0, 1, 0, 1, 0, blindObserver, getRandomMovement).concat([
        new Timeout(20, (entity) => {
            entity.become(grasshopperPupa(entity.Position.x, entity.Position.y));
        }, 'The grasshopper larvae becomes a pupa.'),
        new Tile('(', 'green', null, 2), 
        new Name('grasshopper larvae', 'Gr Hppr Larvae'),
        new CombatNeutral(),
        new WalkTime(3),
        new Getable()
    ]);
}

export function antPupa(x, y) {
    return character(x, y, 3, 0, 10, 0, 0, 0, blindObserver, getWait).concat([
        new Tile('[', 'blue', null, 2), 
        new Name('ant pupa', 'Ant Pupa'),
        new CombatNeutral(),
        new Getable()
    ]);
}

export function grasshopperPupa(x, y) {
    return character(x, y, 4, 0, 8, 0, 0, 0, blindObserver, getWait).concat([
        new Tile('[', 'green', null, 2), 
        new Name('grasshopper pupa', 'Gr Hppr Pupa'),
        new CombatNeutral(),
        new Getable()
    ]);
}

export function ant(x, y) {
    return character(x, y, 4, 4, 2, 3, 2, 10, detectVisibleArea, moveTowardsPlayer).concat([
        new Tile('a', 'blue', null, 2), 
        new Name('ant', 'Ant'),
        new WalkTime(1.5),
        new Combatant(1),
        new CanPush()
    ]);
}

export function grasshopper(x, y) {
    return character(x, y, 8, 5, 1, 2, 6, 10, detectVisibleArea, moveTowardsPlayer).concat([
        new Tile('g', 'green', null, 2), 
        new Name('grasshopper', 'Grass Hopper'),
        new WalkTime(1),
        new Combatant(1)
    ]);
}

export function playerCharacter(x, y) {
    return character(x, y, 10, 4, 4, 4, 4, 20, detectVisibleArea, getPlayerAction).conccat([
        new Tile('@', 'white', null, 4),
        new Inventory(8),
        new WalkTime(1),
        new Combatant(0),
        new Name("Player"),
        new EquipmentSlot()
    ]);
}

export function targetDummy(x, y) {
    return [
        new Position(x, y), 
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
