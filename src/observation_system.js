import {Vec2} from './vec2.js';
import {LightEntity} from './entity.js';
import {tableIterator} from './util.js';
import {OrdinalDirections, OrdinalVectors} from './direction.js';

import {
    PlayerCharacter,
    Position,
    Opacity,
    Vision,
    Name,
    Tile
} from './component.js';

import {ActionType} from './action_type.js';
import {Grid} from './grid.js';

class ObservationCell {
    constructor(x, y) {
        this.coordinates = new Vec2(x, y);
        this.centre = new Vec2(x + 0.5, y + 0.5);
        this.corners = new Array(4);
        for (let [direction, vector] of tableIterator(OrdinalDirections, OrdinalVectors)) {
            this.corners[direction] = this.centre.add(vector.divide(2));
        }
        this.maxOpacity = 0;
    }

    update(entities) {
        var maxOpacity = 0;
        for (let e of entities) {
            if (e.hasComponent(Opacity)) {
                maxOpacity = Math.max(maxOpacity, e.Opacity.value);
            }
        }
        this.maxOpacity = maxOpacity;
    }

    get opacity() {
        return this.maxOpacity;
    }

}

class MemoryCell {
    constructor(entity, turn) {
        this.entity = new LightEntity();
        this.turn = turn;

        //console.debug(entity);
        if (entity.hasComponent(Position)) {
            this.entity.addComponent(entity.Position.clone());
        }
        if (entity.hasComponent(Tile)) {
            this.entity.addComponent(entity.Tile.clone());
        }
        if (entity.hasComponent(Name)) {
            this.entity.addComponent(entity.Name.clone());
        }
    }
}

export class ObservationSystem {
    constructor(level, numCols, numRows) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        for (let [i, j] of this.grid.coordinates()) {
            let entities = this.level.entitySpacialHash.get(j, i);
            let cell = new ObservationCell(j, i);
            cell.update(entities);
            this.grid.set(j, i, cell);
        }
    }

    updateAll() {
        for (let observationCell of this.grid) {
            let entities = this.level.entitySpacialHash.getCart(observationCell.coordinates);
            observationCell.update(entities);
        }
    }

    run(entity) {
        this.updateAll();
        if (entity.hasComponent(Vision)) {
            let visionDistance = entity.Vision.distance;
            let eyePosition = entity.Position.coordinates;
            for (let observationCell of entity.Actor.observe(eyePosition, visionDistance, this.grid)) {
                let entities = this.level.entitySpacialHash.getCart(observationCell.coordinates);
                let memoryCell = entity.Memory.value.getCart(this.level, observationCell.coordinates);
                memoryCell.clear();
                for (let e of entities) {
                    memoryCell.add(new MemoryCell(e, this.level.turn));
                }
            }
        }
    }
}
