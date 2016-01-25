import {Level} from './level.js';
import {Entity} from './entity.js';
import {Grid} from './grid.js';
import {LinkedList} from './linked_list.js';
import {Vec2} from './vec2.js';
import {CardinalDirectionVectors} from './direction.js';
import {arrayShuffle, randomInt, arrayRandom} from './util.js';

import * as Assets from './assets.js';

class Connection {
    constructor(neighbourCoordinates, edgeCoordinates) {
        this.neighbourCoordinates = neighbourCoordinates;
        this.edgeCoordinates = edgeCoordinates;
        this.connected = false;
    }
}

class Node {
    constructor(coordinates) {
        this.coordinates = coordinates;
        this.visited = false;

        var neighbourCoordinates = CardinalDirectionVectors.map((v) => {
            return this.coordinates.add(v.multiply(2));
        });

        var edgeCoordinates = CardinalDirectionVectors.map((v) => {
            return this.coordinates.add(v);
        });

        this.neighbours = [];
        for (let i = 0; i < 4; ++i) {
            this.neighbours[i] = new Connection(neighbourCoordinates[i], edgeCoordinates[i]);
        }
        
        arrayShuffle(this.neighbours);
    }
}

export function generateAntHillLevel(width, height, includePlayerCharacter) {
    let level = new Level(width, height);
    let entities = new Set();
    let add = (e, x, y) => {
        entities.add(new Entity(e(x, y, level)));
    };

    let visited = new Grid(width, height);

    let startCoordinates = new Vec2(
        randomInt(1, width - 2),
        randomInt(1, height - 2)
    );

    let start = new Connection(startCoordinates, null);

    let stack = new LinkedList([start]);

    while (!stack.empty) {
        let current = stack.pop();

        if (visited.getCart(current.neighbourCoordinates)) {
            continue;
        }

        if (current.neighbourCoordinates.x < 1 || current.neighbourCoordinates.x > width - 2 ||
            current.neighbourCoordinates.y < 1 ||current.neighbourCoordinates.y > height - 2) {

            continue;
        }

        visited.setCart(current.neighbourCoordinates, true);
        add(Assets.floor, current.neighbourCoordinates.x, current.neighbourCoordinates.y);
        if (current.edgeCoordinates) {
            visited.setCart(current.edgeCoordinates, true);
            add(Assets.floor, current.edgeCoordinates.x, current.edgeCoordinates.y);
        }

        let node = new Node(current.neighbourCoordinates);
        for (let n of node.neighbours) {
            if (visited.hasCoordinateCart(n.neighbourCoordinates) &&
                !visited.getCart(n.neighbourCoordinates)) {

                stack.push(n);
            }
        }
    }

    let emptyCoordinates = [];
    for (let [i, j] of visited.coordinates()) {
        if (visited.get(j, i)) {
            emptyCoordinates.push(new Vec2(j, i));
        } else {
            add(Assets.wall, j, i);
        }
    }

    let playerCoordinates = arrayRandom(emptyCoordinates);

    if (includePlayerCharacter) {
        add(Assets.playerCharacter, playerCoordinates.x, playerCoordinates.y);
    }

    level.initialize(entities);
    return level;
}
