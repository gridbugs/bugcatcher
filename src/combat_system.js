import {GridSystem} from './grid_system.js';
import {EntitySet} from './entity.js';

import {
    MeleeAttack,
    MeleeAttackDodge,
    MeleeAttackHit,
    MeleeAttackBlock
} from './action.js';
import {ActionType} from './action_type.js';

import {opposingRoll, getStatistic} from './statistics.js';

import {
    Combatant,
    Accuracy,
    Dodge,
    MeleeDamage,
    Armour
} from './component.js';


export class CombatSystem extends GridSystem {
    constructor(level, entities, numCols, numRows) {
        super(level, entities, numCols, numRows, EntitySet, (e) => {
            return e.hasComponent(Combatant);
        });
    }
 
    handleMove(action) {
        if (action.entity.hasComponent(Combatant)) {
            let toCell = this.grid.getCart(action.toCoord);
            for (let e of toCell.keys()) {
                if (e.hasComponent(Combatant)) {
                    action.fail();
                    this.level.scheduleImmediateAction(new MeleeAttack(action.entity, e));
                    break;
                }
            }
        }
    }

    handleMeleeAttack(action) {
        let attacker = action.entity;
        let target = action.target;

        let attackHitsCmp = opposingRoll(getStatistic(attacker, Accuracy), getStatistic(target, Dodge));
        if (attackHitsCmp <= 0) {
            this.level.scheduleImmediateAction(new MeleeAttackDodge(action));
            return;
        }
        let attackDamage = getStatistic(attacker, MeleeDamage) - getStatistic(target, Armour);
        if (attackDamage <= 0) {
            this.level.scheduleImmediateAction(new MeleeAttackBlock(action));
            return;
        }
        this.level.scheduleImmediateAction(new MeleeAttackHit(action, attackDamage));
    }

    check(action) {
        switch (action.type) {
        case ActionType.Move:
            this.handleMove(action);
            break;
        case ActionType.MeleeAttack:
            this.handleMeleeAttack(action);
            break;
       }
    }
}
