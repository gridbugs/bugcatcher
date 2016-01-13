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
    'OnLevel'
);

export const ComponentNames = mknametable(ComponentTypes);
