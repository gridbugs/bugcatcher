import {Vec2} from './vec2.js';
import {mkenum, mktable, mknametable} from './util.js';

export const CardinalDirections = mkenum(
    'North',
    'East',
    'South',
    'West'
);

export const OrdinalDirections = mkenum(
    'NorthEast',
    'SouthEast',
    'SouthWest',
    'NorthWest'
);

export const Directions = mkenum(
    'North',
    'NorthEast',
    'East',
    'SouthEast',
    'South',
    'SouthWest',
    'West',
    'NorthWest'
);

export const CardinalDirectionVectors = mktable(CardinalDirections, {
    North:  new Vec2(0, -1),
    East:   new Vec2(1, 0),
    South:  new Vec2(0, 1),
    West:   new Vec2(-1, 0)
});

export const OrdinalDirectionVectors = mktable(OrdinalDirections, {
    NorthEast: new Vec2(1, -1),
    SouthEast: new Vec2(1, 1),
    SouthWest: new Vec2(-1, 1),
    NorthWest: new Vec2(-1, -1)
});

export const DirectionVectors = mktable(Directions, {
    North:      new Vec2(0, -1),
    NorthEast:  new Vec2(1, -1),
    East:       new Vec2(1, 0),
    SouthEast:  new Vec2(1, 1),
    South:      new Vec2(0, 1),
    SouthWest:  new Vec2(-1, 1),
    West:       new Vec2(-1, 0),
    NorthWest:  new Vec2(-1, -1)
});

export const DirectionNames = mknametable(Directions);
