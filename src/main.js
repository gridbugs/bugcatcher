import {AvlTree} from './avl_tree.js';
import {Vec2} from './vec2.js';
import {Grid} from './grid.js';
import {getKey, getKeyCode} from './input.js';
import {mdelay} from './time.js';
import {mkenum, mknametable, tableIterator} from './util.js';
import {CardinalDirections, CardinalVectors, OrdinalDirections, OrdinalVectors} from './direction.js';
import {Schedule} from './schedule.js';
import {Entity, EntityMap} from './entity.js';
import {SpacialHash, AggregateSpacialHash} from './spacial_hash.js';
import {detectVisibleArea} from './recursive_shadowcast.js';
import {
    Position,
    Tile,
    Actor,
    Solid,
    Collider,
    PlayerCharacter,
    Memory,
    Vision,
    Opacity
} from './component.js';

import {Observation} from './observation.js';
import {Level} from './level.js';

import {Move} from './action.js';

var entities = [];

var worldString = [
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
'&                                               &                       &', 
'&  &             &   &  &&               &              &&              &', 
'&   &      &         & &        ######################    &&&&&     &&  &', 
'&    &                          #....................#        &&&    && &', 
'&      &      ###################....................#     &          &&&', 
'&      &      #........#........#....................#           &      &', 
'& &   &       #........#........#....................#            &     &', 
'&             #........#........#....................#             &    &', 
'& &           #.................#.....................                  &', 
'&             #........#........#.@..................#   &   &        & &', 
'&     #############.####........#....................#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#....................#                  &', 
'&     #................#........#....................#    &     & &     &', 
'&     #................#........#....................#                  &', 
'&  &  .................#........#....................#          & &     &', 
'&     #................#........#....................#      &         & &', 
'&  &  #................###############.###############      &           &', 
'&     #................#...................#                            &', 
'&     #................#...................#               &   &     &  &', 
'&     ##################...................#                            &', 
'&                      #...................#          &                 &', 
'&   & &  &             #....................      &            &    &   &', 
'&         &            #...................#       &  &             &   &', 
'&    &&  & &        &  #...................#        &       &           &', 
'&     &    &        &  #...................#                  &     &   &', 
'&      &    &&&        #####################                        &   &', 
'&                                                                       &', 
'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', 
];

function makeTree(x, y) {
    return new Entity(new Position(x, y), new Tile('&', 'green', null, 1), new Solid(), new Opacity(0.5));
}
function makeWall(x, y) {
    return new Entity(new Position(x, y), new Tile('#', '#222222', '#888888', 1), new Solid(), new Opacity(1));
}
function makeGrass(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'darkgreen', null, 0), new Opacity(0));
}
function makeFloor(x, y) {
    return new Entity(new Position(x, y), new Tile('.', 'gray', null, 0), new Opacity(0));
}


function makePlayerCharacter(x, y) {
    return new Entity(  new Position(x, y),
                        new Tile('@', 'white', null, 2),
                        new Actor(detectVisibleArea, getPlayerAction),
                        new PlayerCharacter(),
                        new Collider(),
                        new Memory(),
                        new Vision(20),
                        new Opacity(0.2)
                    );
}

function initWorld() {
    for (let i = 0; i < worldString.length; ++i) {
        let line = worldString[i];
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
            case '.':
                entities.push(makeFloor(j, i));
                break;
            case ' ':
                entities.push(makeGrass(j, i));
                break;
            case '@':
                entities.push(makeFloor(j, i));
                entities.push(makePlayerCharacter(j, i));
                break;
            }
        }
    }
}



const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
}


async function getPlayerAction(entity) {
    while (true) {
        var code = await getKeyCode();
        switch (code) {
        case KeyCodes.Up:
            return new Move(entity, CardinalDirections.North);
        case KeyCodes.Down:
            return new Move(entity, CardinalDirections.South);
        case KeyCodes.Left:
            return new Move(entity, CardinalDirections.West);
        case KeyCodes.Right:
            return new Move(entity, CardinalDirections.East);
        }
    }
}

var ActionType = mkenum(
    'Move'
);

function getPlayerCharacter() {
    for (let e of entities) {
        if (e.hasComponent(PlayerCharacter)) {
            return e;
        }
    }

    throw new Error('No player character');
}


$(() => {(async function() {
    
    const WIDTH = 74
    const HEIGHT = 30
    initWorld();

    var level = new Level(WIDTH, HEIGHT, entities);
    var playerCharacter = getPlayerCharacter();
    level.scheduleActorTurn(playerCharacter, 0);
    await level.gameLoop();

})();})
