import * as Assets from './assets.js';

import {Heap} from './heap.js';
import {Entity} from './entity.js';
import {mkenum, randomInt, arrayShuffle, arrayRandom} from './util.js';
import {Grid} from './grid.js';
import {Vec2} from './vec2.js';
import {CardinalDirectionVectors, CardinalDirections} from './direction.js';

let Tile = mkenum(
    'Wall',
    'Floor',
    'Boulder',
    'Tree',
    'Door'
);

class Node {
    constructor(vertex, edge = null, parent = null, direction = 0) {
        this.vertex = vertex;
        this.edge = edge;
        this.direction = direction;
        if (parent == null) {
            this.length = 1;
            this.directionLength = 1;
        } else {
            this.length = parent.length + 1;
            if (this.direction == parent.direction) {
                this.directionLength = parent.directionLength + 1;
            } else {
                this.directionLength = 1;
            }
        }
        this.cost = Math.random();
    }
}

export function generateLevel(level, width, height, includePlayerCharacter = false, previousLevel = null, includeStairs = true) {
    level.previousLevel = previousLevel;
    let entities = new Set();
    let add = (e, x, y) => {
        let entity = new Entity(e(x, y, level));
        entities.add(entity);
        return entity;
    };

    let grid = new Grid(width, height);
    for (let cell of grid.cells()) {
        cell.value = Tile.Wall;
    }

    let visited = new Grid(width, height);
    for (let cell of visited.cells()) {
        cell.value = false;
    }

    let queue = new Heap((a, b) => {
        return a.cost - b.cost;
    });

    let start = new Vec2(
        randomInt(1, (width - 1) / 2) * 2,
        randomInt(1, (height - 1) / 2) * 2
    );

    queue.insert(new Node(start));

    let directionIndices = [0, 1, 2, 3];

    while (!queue.empty) {
        let current = queue.pop();
        let coord = current.vertex;

        if (visited.get(coord)) {
            continue;
        }

        visited.set(coord, true);
        grid.set(coord, Tile.Floor);
        if (current.edge != null) {
            grid.set(current.edge, Tile.Floor);
        }

        arrayShuffle(directionIndices);
        for (let i of directionIndices) {
            let vector = CardinalDirectionVectors[i];
            let edge = coord.add(vector);
            let vertex = coord.add(vector.multiply(2));
            if (grid.hasCoord(vertex) && !grid.isBorderCoord(vertex) && !visited.get(vertex)) {
                queue.insert(new Node(vertex, edge, current, i));
            }
        }
    }

    let getEnds = () => {
        let ends = new Set();
        for (let cell of grid.cells()) {
            if (cell.value != Tile.Wall) {
                continue;
            }
            let count = 0;
            let direction;
            for (let [n, d] of cell.cardinalNeighboursWithDirection()) {
                if (n.value == Tile.Wall) {
                    ++count;
                    direction = d;
                }
            }
            if (count == 1) {
                ends.add({cell: cell, direction: direction});
            }
        }
        return ends;
    };

    for (let i = 0; i < 1; ++i) {
       for (let end of getEnds()) {
            let cell = end.cell;
            while (true) {

                let count = 0;
                for (let n of cell.cardinalNeighbours()) {
                    if (n.value == Tile.Wall) {
                        ++count;
                    }
                }
                if (count != 1) {
                    break;
                }
                let next = grid.getCell(cell.coordinates.add(CardinalDirectionVectors[end.direction]));
                if (next.value != Tile.Wall) {
                    break;
                }
                
                cell.value = Tile.Floor;
                cell = next;
            }
        }
    }

    for (let i = 0; i < 20; ++i) {
        let ends = new Set();
        for (let cell of grid.cells()) {
            if (cell.value != Tile.Floor) {
                continue;
            }
            let count = 0;
            for (let n of cell.cardinalNeighbours()) {
                if (n.value == Tile.Wall) {
                    ++count;
                }
            }
            if (count >= 3) {
                ends.add(cell);
            }
        }
        for (let end of ends) {
            end.value = Tile.Wall;
        }
    }

    for (let i = 0; i < 20; ++i) {
        let endDistances = new Grid(width, height);
        let ends = getEnds();
        queue = [];
        for (let end of ends) {
            end.distance = 0;
            queue.push(end);
        }
        while (queue.length != 0) {
            let node = queue.shift();

            if (endDistances.get(node.cell) != undefined) {
                continue;
            }

            endDistances.set(node.cell, node.distance);
            for (let n of node.cell.cardinalNeighbours()) {
                if (n.value == Tile.Wall && endDistances.get(n) == undefined) {
                    queue.push({cell: n, distance: node.distance + 1});
                }
            }
        }
        
        let candidates = [];

        for (let cell of grid.cells()) {
            let distance = endDistances.get(cell);
            if (distance == null) {
                continue;
            }
            if (grid.isBorderCoord(cell)) {
                continue;
            }
            if (endDistances.get(cell) > 8) {
                if ((cell.getCardinalNeighbour(CardinalDirections.North).value == Tile.Wall &&
                    cell.getCardinalNeighbour(CardinalDirections.South).value == Tile.Wall &&
                    cell.getCardinalNeighbour(CardinalDirections.East).value == Tile.Floor &&
                    cell.getCardinalNeighbour(CardinalDirections.West).value == Tile.Floor) ||
                    (cell.getCardinalNeighbour(CardinalDirections.North).value == Tile.Floor &&
                    cell.getCardinalNeighbour(CardinalDirections.South).value == Tile.Floor &&
                    cell.getCardinalNeighbour(CardinalDirections.East).value == Tile.Wall &&
                    cell.getCardinalNeighbour(CardinalDirections.West).value == Tile.Wall)) {
                    
                    candidates.push(cell);
                }
            }
        }

        if (candidates.length > 0) {
            if (Math.random() < 0.2) {
                arrayRandom(candidates).value = Tile.Boulder;
            } else {
                arrayRandom(candidates).value = Tile.Door;
            }
        }
    }

    for (let cell of grid.cells()) {
        switch (cell.value) {
        case Tile.Wall:
            add(Assets.dirtWall, cell.x, cell.y);
            break;
        case Tile.Floor:
            add(Assets.dirt, cell.x, cell.y);
            break;
        case Tile.Boulder:
            add(Assets.boulder, cell.x, cell.y);
            break;
        case Tile.Tree:
            add(Assets.tree, cell.x, cell.y);
            break;
        case Tile.Door:
            add(Assets.door, cell.x, cell.y);
            break;
        }
    }

    let stairsDistancePoint;

    let emptyCoordinates = [];
    for (let cell of grid.cells()) {
        if (cell.value == Tile.Floor) {
            emptyCoordinates.push(cell.coordinates);
        }
    }
    let playerStart = arrayRandom(emptyCoordinates);
    if (includePlayerCharacter) {
        add(Assets.playerCharacter, playerStart.x, playerStart.y);
    }
    stairsDistancePoint = playerStart;
    level.playerStart = playerStart;

    if (includeStairs) {

        let stairsDistanceMap = new Grid(width, height);
        queue = [{coordinates: stairsDistancePoint, distance: 0}];
        while (queue.length != 0) {
            let node = queue.shift();

            if (stairsDistanceMap.get(node.coordinates) != null) {
                continue;
            }

            stairsDistanceMap.set(node.coordinates, node.distance);

            for (let i = 0; i < CardinalDirectionVectors.length; ++i) {
                let next = {coordinates: node.coordinates.add(CardinalDirectionVectors[i]), distance: node.distance + 1};
                if (stairsDistanceMap.get(next.coordinates) == null && stairsDistanceMap.hasCoord(next.coordinates) && 
                    (grid.get(next.coordinates) == Tile.Floor ||  grid.get(next.coordinates) == Tile.Door) 
                ) {
                    queue.push(next);
                }
            }
        }

        let distanceHeap = new Heap((a, b) => {return a.value - b.value});
        for (let cell of stairsDistanceMap.cells()) {
            if (cell.value != null) {
                distanceHeap.insert(cell);
            }
        }

        for (let i = 0; i < 20; ++i) {
            distanceHeap.pop();
        }

        let stairsPosition;
        while (true) {
            stairsPosition = distanceHeap.pop().coordinates;
            if (grid.get(stairsPosition) == Tile.Floor) {
                break;
            }
        }

        level.downStairs = add(Assets.downStairs, stairsPosition.x, stairsPosition.y);
    }

    level.initialize(entities);
}
