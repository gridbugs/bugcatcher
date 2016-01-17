import {Vec2} from './vec2.js';
import {EntityMap} from './entity.js';
import {AggregateSpacialHash} from './spacial_hash.js';
import {tableIterator} from './util.js';
import {OrdinalDirections, OrdinalVectors} from './direction.js';
import {PlayerCharacter, Position, Opacity, Vision} from './component.js';
import {ActionType} from './action_type.js';

class ObservationEntityMap extends EntityMap {
    constructor(x, y) {
        super();
        this.coordinate = new Vec2(x, y);
        this.centre = new Vec2(x + 0.5, y + 0.5);
        this.corners = new Array(4);
        for (let [direction, vector] of tableIterator(OrdinalDirections, OrdinalVectors)) {
            this.corners[direction] = this.centre.add(vector.divide(2));
        }
        this.maxOpacity = 0;
    }

    updateAggregate() {
        var maxOpacity = 0;
        for (let opacity of this.values()) {
            maxOpacity = Math.max(maxOpacity, opacity);
        }
        this.maxOpacity =  maxOpacity;
    }

    get opacity() {
        return this.maxOpacity;
    }

}

export class ObservationSystem {
    constructor(level, entities, numCols, numRows) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new AggregateSpacialHash(this.numCols, this.numRows, ObservationEntityMap).initialize(
            entities,
            (e) => {return e.hasComponents(Position, Opacity)},
            (e) => {
                return e.Opacity.value
            }
        );
    }

    run(entity) {
        if (entity.hasComponent(Vision)) {
            var visionDistance = entity.Vision.distance;
            var eyePosition = entity.Position.vec;
            for (let cell of entity.Actor.observe(eyePosition, visionDistance, this.grid)) {
                for (let e of cell.keys()) {
                    entity.Memory.lastSeenTimes.set(this.level, e, this.level.turn);
                }
            }
        }
    }

    update(action) {
        switch (action.type) {
        case ActionType.Move:
            this.grid.updateOnMoveAction(action);
            break;
        case ActionType.OpenDoor:
        case ActionType.CloseDoor:
            let cell = this.grid.getCart(action.door.Position.vec);
            cell.set(action.door, action.door.Opacity.value);
            cell.updateAggregate();
            break;
        case ActionType.EnterLevel:
            this.grid.getCart(action.coordinates)
                .set(action.entity, action.entity.Opacity.value);
            break;
        case ActionType.JumpPart:
            this.grid.getCart(action.destination)
                .set(action.entity, action.entity.Opacity.value);
            break;
        }
    }
}
