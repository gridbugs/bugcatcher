import {mdelay} from './time.js';
import {DirectionVectors, Directions} from './direction.js';
import {Grid} from './grid.js';
import {Heap} from './heap.js';
import {getDefaultDrawer} from './drawer.js';
import {NoResults} from './exception.js';
import {ObjectPool} from './object_pool.js';
import {WIDTH, HEIGHT} from './config.js';

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
var nodePool = new ObjectPool(Node);

function initSharedData(grid) {
    nodePool.flush();
    priorityQueue.clear();
    for (let i = 0; i < HEIGHT; ++i) {
        for (let j = 0; j < WIDTH; ++j) {
            visitedSet.set(j, i, undefined);
            seenSet.set(j, i, undefined);
        }
    }
}

function allocateNode(coordinates, direction, cost, heuristic = 0) {
    return nodePool.allocate().init(coordinates, direction, cost, heuristic);
}

export function shortestPathThroughGridUntilPredicate(grid, start, predicate,
                    enterPredicate=()=>{return true},
                    directions,
                    getMoveCost=()=>{return 1}) {

    initSharedData();

    let startNode = allocateNode(start, 0, start.getDistance(end));
    priorityQueue.insert(startNode);
    seenSet.setCart(start, startNode);

    while (!priorityQueue.empty) {
        let currentNode = priorityQueue.pop();
        let currentCell = grid.getCart(currentNode.coordinates);

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

            let cell = grid.getCart(neighbourCoordinates);
            if (!enterPredicate(cell, neighbourCoordinates)) {
                continue;
            }

            let node = allocateNode(neighbourCoordinates, direction,
                currentNode.cost + getMoveCost(grid, currentNode.coordinates, neighbourCoordinates));

            let seenNode = seenSet.getCart(neighbourCoordinates);
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

    initSharedData();

    let startNode = allocateNode(start, 0, start.getDistance(end));
    priorityQueue.insert(startNode);
    seenSet.setCart(start, startNode);

    while (!priorityQueue.empty) {
        let currentNode = priorityQueue.pop();

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

            let cell = grid.getCart(neighbourCoordinates);
            if (!enterPredicate(cell, neighbourCoordinates)) {
                continue;
            }

            let node = allocateNode(neighbourCoordinates, direction,
                currentNode.cost + getMoveCost(grid, currentNode.coordinates, neighbourCoordinates),
                heuristic(neighbourCoordinates, end));

            let seenNode = seenSet.getCart(neighbourCoordinates);
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
