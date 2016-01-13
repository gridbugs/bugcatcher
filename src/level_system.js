import {ActionType} from './action_type.js';
import {} from './action.js';

export class LevelSystem {
    constructor(level) {
        this.level = level;
    }

    check(action) {
        switch (action.type) {
        case ActionType.Descend:
            this.level.scheduleImmediateAction(new ExitLevel(action.entity));
            action.stairs.DownStairs.level.scheduleImmediateAction(new EnterLevel(action.entity, action.stairs));
        }
    }
}
