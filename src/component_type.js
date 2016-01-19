import {mkenum, mknametable} from './util.js';

export const ComponentType = mkenum(
    'Position',
    'Tile',
    'Actor',
    'Solid',
    'Collider',
    'PlayerCharacter',
    'Memory',
    'Vision',
    'Opacity',
    'Door',
    'DownStairs',
    'UpStairs',
    'Combatant',
    'Health',
    'Armour',
    'Dodge',
    'Accuracy',
    'MeleeDamage',
    'Name',
    'Inventory',
    'Getable',
    'Ability',
    'Pushable',
    'CanPush'
);

export const ComponentNames = mknametable(ComponentType);
