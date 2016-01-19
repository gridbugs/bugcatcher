import {mkenum, mknametable} from './util.js';

export const ComponentTypes = mkenum(
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
    'Getable'
);

export const ComponentNames = mknametable(ComponentTypes);
