import {getKey, getKeyCode, getChar} from './input.js';
import {Entity} from './entity.js';
import {detectVisibleArea} from './recursive_shadowcast.js';
import {initializeDefaultDrawer, getDefaultDrawer}  from './drawer.js';
import * as Assets from './assets.js';
import * as Config from './config.js';
import {UpStairs, DownStairs, Position, Actor, PlayerCharacter, Timeout, Inventory} from './component.js';

import {Level} from './level.js';

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
'&             #........#........#....................#             &    &', 
'& &           #.................#........@...........+                  &', 
'&             #........#........#..>.....g...........#   &   &        & &', 
'&     #############.####........#....................#             &    &', 
'&     #................#.............................#           &      &', 
'&   & #.........................#.*.*................#                  &', 
'&     #................#........#...a*...............#    &     & &     &', 
'&     #................#........#..*.................#                  &', 
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

function make(components) {
    return new Entity(components);
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
                entities.push(make(Assets.tree(j, i)));
                entities.push(make(Assets.grass(j, i)));
                break;
            case '#':
                entities.push(make(Assets.wall(j, i)));
                entities.push(make(Assets.floor(j, i)));
                break;
            case '+':
                entities.push(make(Assets.door(j, i)));
                entities.push(make(Assets.floor(j, i)));
                break;
            case '.':
                entities.push(make(Assets.floor(j, i)));
                break;
            case ' ':
                entities.push(make(Assets.grass(j, i)));
                break;
            case ',':
                entities.push(make(Assets.dirt(j, i)));
                break;
            case '@':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.playerCharacter(j, i)));
                break;
            case '*':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.boulder(j, i)));
                break;
            case 't':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.targetDummy(j, i)));
                break;
            case '(':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.antLarvae(j, i)));
                break;
            case ')':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.grasshopperLarvae(j, i)));
                break;
            case 'g':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.grasshopper(j, i)));
                break;
            case 'a':
                entities.push(make(Assets.floor(j, i)));
                entities.push(make(Assets.ant(j, i)));
                break;
            case '%':
                entities.push(make(Assets.dirt(j, i)));
                entities.push(make(Assets.dirtWall(j, i)));
                break;
            case '>':
                entities.push(make(Assets.downStairs(j, i)));
                break;
            case '<':
                entities.push(make(Assets.upStairs(j, i)));
                break;
            }
        }
    }
    return entities;
}

var playerCharacter;

function getPlayerCharacter(entities) {
    for (let e of entities) {
        if (e.hasComponent(PlayerCharacter)) {
            return e;
        }
    }

    throw new Error('No player character');
}

async function gameLoop(playerCharacter) {
    var level;
    while (true) {
        level = playerCharacter.Position.level;
        await level.progressSchedule();
        if (!playerCharacter.Actor.active) {
            break;
        }
    }
    level.observationSystem.run(playerCharacter);
    level.rendererSystem.run(playerCharacter);
    level.hudSystem.run(playerCharacter);
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
 
    initializeDefaultDrawer(Config.WIDTH, Config.HEIGHT, document.getElementById(Config.CANVAS_NAME));

    surfaceLevel = new Level(Config.WIDTH, Config.HEIGHT, initWorld(surfaceString), true);
    dungeonLevel = new Level(Config.WIDTH, Config.HEIGHT, initWorld(dungeonString));

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
            if (e.hasComponent(Actor)) {
                e.Actor.enable(surfaceLevel);
            }
        }

        playerCharacter = getPlayerCharacter(surfaceLevel.entities);

        surfaceLevel.setPlayerCharacter(playerCharacter);
        dungeonLevel.setPlayerCharacter(playerCharacter);


        for (let level of [surfaceLevel, dungeonLevel]) {
            level.registerPeriodicFunction(processTimeouts, 1);
        }

    })();

    await gameLoop(playerCharacter);

})();})
