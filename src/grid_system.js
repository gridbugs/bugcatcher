import {SpacialHash} from './spacial_hash.js';
import {ActionType} from './action_type.js';

export class GridSystem {
    constructor(level, entities, numCols, numRows, Container,
                predicate = (e) => {return true;}, f = (e) => {return e;}) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.predicate = predicate;
        this.grid = new SpacialHash(this.numCols, this.numRows, Container).initialize(
            entities,
            predicate,
            f
        );
    }

    updateMoveAction(action) {
        switch (action.type) {
        case ActionType.JumpPart:
        case ActionType.Move:
            this.grid.updateOnMoveAction(action);
            break;
        }
    }

    update(action) {
        this.updateMoveAction(action);
    }
}
