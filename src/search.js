import {mdelay} from './time.js';
import {DirectionVectors, Directions} from './direction.js';
import {Grid} from './grid.js';
import {Heap} from './heap.js';
import {getDefaultDrawer} from './drawer.js';
import {NoResults} from './exception.js';
import {ObjectPool} from './object_pool.js';
class Node {
    init(coordinates, direction, cost, heuristic = 0) {
        this.coordinates = coordinates;
        this.direction = direction;
        this.cost = cost;
        this.total = cost + heuristic;
        this.parent = null;
        return this;
    }
}
import {WIDTH, HEIGHT} from './config.js';

var NodePool = new ObjectPool(Node);

class SearchResult {
    constructor(end) {
        this.end = end.coordinates;
        this.cost = end.cost;
        this.vectors = [];
        this.directions = [];
        this.constructArray(end);
        this.length = this.vectors.length;
    }

    constructArray(node) {
        if (node.parent == null) {
            this.start = node.coordinates;
        } else {
            this.constructArray(node.parent);
            this.vectors.push(node.coordinates);
            this.directions.push(node.direction);
        }
    }
}

var priorityQueue = new Heap((a, b) => {return b.total - a.total});
var visitedSet = new Grid(WIDTH, HEIGHT);
var seenSet = new Grid(WIDTH, HEIGHT);

function init(grid) {
    NodePool.flush();
    priorityQueue.clear();
    for (let i = 0; i < grid.height; ++i) {
        for (let j = 0; j < grid.width; ++j) {
            visitedSet.set(j, i, undefined);
            seenSet.set(j, i, undefined);
        }
    }
}

export function shortestPathThroughGridUntilPredicate(grid, start, predicate,
                    enterPredicate=()=>{return true},
                    directions,
                    getMoveCost=()=>{return 1}) {
    init(grid);
    var startNode = NodePool.allocate().init(start, null, 0);
    priorityQueue.insert(startNode);
    seenSet.setCart(start, startNode);

    while (!priorityQueue.empty) {
        var currentNode = priorityQueue.pop();
        var currentCell = grid.getCart(currentNode.coordinates);

        if (visitedSet.getCart(currentNode.coordinates) != undefined) {
            // current node has already been visited
            continue;
        }
        
        if (predicate(currentCell, currentNode.coordinates)) {
            return new SearchResult(currentNode);
        }

        for (let i = 0; i < directions.length; ++i) {
            let direction = directions[i];
            let neighbourCoordinates = currentNode.coordinates.add(DirectionVectors[direction]);

            if (!grid.hasCoordinateCart(neighbourCoordinates)) {
                continue;
            }

            var cell = grid.getCart(neighbourCoordinates);
            if (!enterPredicate(cell, neighbourCoordinates)) {
                continue;
            }

            var node = NodePool.allocate().init(neighbourCoordinates, direction,
                currentNode.cost + getMoveCost(grid, currentNode.coordinates, neighbourCoordinates));

            var seenNode = seenSet.getCart(neighbourCoordinates);
            if (seenNode == undefined || node.total < seenNode.total) {
                // either we've never seen this node, or we have, but the new cost is lower
                node.parent = currentNode;
                seenSet.setCart(neighbourCoordinates, node);
                priorityQueue.insert(node);
            }
        }

        visitedSet.setCart(currentNode.coordinates, true);
    }
}

export function shortestPathThroughGrid(grid, start, end,
                    enterPredicate=()=>{return true},
                    directions,
                    getMoveCost=()=>{return 1},
                    heuristic=(current, destination) => {return current.getDistance(destination)}) {

    init(grid);
    var startNode = NodePool.allocate().init(start, 0, start.getDistance(end));
    priorityQueue.insert(startNode);
    seenSet.setCart(start, startNode);

    while (!priorityQueue.empty) {
        var currentNode = priorityQueue.pop();

        if (currentNode.coordinates.equals(end)) {
            return new SearchResult(currentNode);
        }

        if (visitedSet.getCart(currentNode.coordinates) != undefined) {
            // current node has already been visited
            continue;
        }

        for (let i = 0; i < directions.length; ++i) {
            let direction = directions[i];
            let neighbourCoordinates = currentNode.coordinates.add(DirectionVectors[direction]);

            var cell = grid.getCart(neighbourCoordinates);
            if (!enterPredicate(cell, neighbourCoordinates)) {
                continue;
            }

            var node = NodePool.allocate().init(neighbourCoordinates, direction,
                currentNode.cost + getMoveCost(grid, currentNode.coordinates, neighbourCoordinates),
                heuristic(neighbourCoordinates, end));

            var seenNode = seenSet.getCart(neighbourCoordinates);
            if (seenNode == undefined || node.total < seenNode.total) {
                // either we've never seen this node, or we have, but the new cost is lower
                node.parent = currentNode;
                seenSet.setCart(neighbourCoordinates, node);
                priorityQueue.insert(node);
            }
        }

        visitedSet.setCart(currentNode.coordinates, true);
    }
}
