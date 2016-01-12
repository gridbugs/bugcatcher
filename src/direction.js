import {Vec2} from './vec2.js';
import {mkenum, mktable} from './util.js';

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

export const CardinalVectors = mktable(CardinalDirections, {
    North:  new Vec2(0, -1),
    East:   new Vec2(1, 0),
    South:  new Vec2(0, 1),
    West:   new Vec2(-1, 0)
});

export const OrdinalVectors = mktable(OrdinalDirections, {
    NorthEast: new Vec2(1, -1),
    SouthEast: new Vec2(1, 1),
    SouthWest: new Vec2(-1, 1),
    NorthWest: new Vec2(-1, -1)
});
