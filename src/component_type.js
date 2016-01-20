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
    'Defence',
    'Dodge',
    'Accuracy',
    'Attack',
    'Name',
    'Inventory',
    'Getable',
    'Ability',
    'Pushable',
    'CanPush',
    'Cooldown',
    'EquipmentSlot',
    'Timeout'
);

export const ComponentNames = mknametable(ComponentType);
