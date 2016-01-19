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
    Attack,
    Defence
} from './component.js';


export class CombatSystem {
    constructor(level) {
        this.level = level;
    }
 
    handleMove(action) {
        if (action.entity.hasComponent(Combatant)) {
            let toCell = this.level.entitySpacialHash.getCart(action.destination);
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
        let attackDamage = getStatistic(attacker, Attack) - getStatistic(target, Defence);
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
        case ActionType.JumpPart:
            if (action.entity.hasComponent(Combatant)) {
                let toCell = this.level.entitySpacialHash.getCart(action.destination);
                for (let e of toCell.keys()) {
                    if (e.hasComponents(Combatant)) {
                        action.fail();
                        break;
                    }
                }
            }
            break;
       }
    }
}
