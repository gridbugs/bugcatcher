import {ActionType} from './action_type.js';
import {
    PlayerCharacter,
    Pushable,
    CanPush,
    Position
} from './component.js';

export class DescriptionSystem {
    constructor(level, element = DescriptionSystem.getDefaultElement()) {
        this.$element = $(element);
        this.element = element;
        this.level = level;
    }

    scrollToBottom() {
        this.element.scrollTop = this.element.scrollHeight;
    }

    createMessage(string) {
        return `<div class="message">${string}</div>`;
    }

    printString(string) {
        this.$element.append(string);
    }

    printMessage(string) {
        this.printString(this.createMessage(string));
        this.scrollToBottom();
    }

    run(entity, action) {
        if (action.entity == null) {
            return;
        }
        if (action.entity != entity && !(action.entity.hasComponent(Position) && entity.canSee(action.entity.Position.coordinates))) {
            let inInventory = false;
            for (let e of entity.Inventory.inventory.contents()) {
                if (e == action.entity) {
                    inInventory = true;
                }
                break;
            }
            if (!inInventory) {
                return;
            }
        }
        switch (action.type) {
        case ActionType.MeleeAttackHit:
            if (action.attacker.hasComponent(PlayerCharacter)) {
                this.printMessage(`You attack the ${action.target.Name.fullName}.`);
                let healthRatio = action.target.Health.value / action.target.Health.maxValue;
                let targetStatus;
                if (healthRatio < 1 && healthRatio >= 0.75) {
                    targetStatus = 'lightly wounded';
                } else if (healthRatio >= 0.5) {
                    targetStatus = 'moderately wounded';
                } else if (healthRatio >= 0.25) {
                    targetStatus = 'heavily wounded';
                } else if (healthRatio > 0) {
                    targetStatus = 'severely wounded';
                }

                if (healthRatio > 0 && healthRatio < 1) {
                    this.printMessage(`The ${action.target.Name.value} looks ${targetStatus}.`);
                }
            } else if (action.target.hasComponent(PlayerCharacter)) {
                this.printMessage(`The ${action.attacker.Name.fullName} attacks you.`);
            }
            break;
        case ActionType.MeleeAttackDodge:
            if (action.attacker.hasComponent(PlayerCharacter)) {
                this.printMessage(`The ${action.target.Name.value} dodges your attack.`);
            } else if (action.target.hasComponent(PlayerCharacter)) {
                this.printMessage(`You dodge the ${action.attacker.Name.fullName}'s attack`);
            }
            break;
        case ActionType.MeleeAttackBlock:
            if (action.attacker.hasComponent(PlayerCharacter)) {
                this.printMessage(`The ${action.target.Name.value} blocks your attack.`);
            } else if (action.target.hasComponent(PlayerCharacter)) {
                this.printMessage(`You block the ${action.attacker.Name.fullName}'s attack`);
            }
            break;
        case ActionType.Die:
            if (action.attack != null && action.attack.attacker.hasComponent(PlayerCharacter)) {
                this.printMessage(`You kill the ${action.target.Name.value}.`);
            } else if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You die.');
            } else {
                this.printMessage(`The ${action.entity.Name.value} dies.`);
            }
            break;
        case ActionType.Ascend:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You climb up the stairs.');
            }
            break;
        case ActionType.Descend:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You climb down the stairs.');
            }
            break;
        case ActionType.OpenDoor:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You open the door.');
            }
            break;
        case ActionType.CloseDoor:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You close the door.');
            }
            break;
        case ActionType.GetItem:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage(`You pick up the ${action.item.Name.fullName}.`);
            }
            break;
        case ActionType.DropItem:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage(`You drop up the ${action.item.Name.fullName}.`);
            }
            break;
        case ActionType.CallFunction:
            this.printMessage(action.description);
            break;
        case ActionType.RemoveComponent:
            if (action.component.expireMessage != null) {
                this.printMessage(action.component.expireMessage);
            }
            break;
        case ActionType.Wait:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('Waiting...');
            }
            break;
        case ActionType.Bump:
            if (action.entity.hasComponent(PlayerCharacter)) {
                if (action.entity.hasComponent(CanPush) && action.obstacle.hasComponent(Pushable)) {
                    this.printMessage(`Cannot push the ${action.obstacle.Name.fullName}. Something is blocking the way.`);
                } else if (action.obstacle.hasComponent(Pushable)) {
                    this.printMessage(`Cannot push the ${action.obstacle.Name.fullName}. Perhaps if you were stronger...`);
                } else {
                    this.printMessage(`You bump into the ${action.obstacle.Name.fullName}. It is immovable.`);
                }
            }
            break;
        case ActionType.EquipItem:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage(`You start channeling the ${action.item.Name.fullName}.`);
            }
            break;
        case ActionType.UnequipItem:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage(`You stop channeling the ${action.item.Name.fullName}.`);
            }
            break;
        case ActionType.FailToEquipItem:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage(`You fail to channel the ${action.item.Name.fullName} as it is cooling down.`);
            }
            break;
        case ActionType.Heal:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You recover some health.');
            }
            break;
        case ActionType.Poison:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You become poisoned.');
            } else {
                this.printMessage(`The ${action.entity.Name.fullName} becomes poisoned.`);
            }
            break;
        case ActionType.IncreasePoison:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You become more poisoned.');
            } else {
                this.printMessage(`The ${action.entity.Name.fullName} becomes more poisoned.`);
            }
            break;
        case ActionType.PosionDamage:
            if (action.entity.hasComponent(PlayerCharacter)) {
                this.printMessage('You suffer from poison.');
            } else {
                this.printMessage(`The ${action.entity.Name.fullName} suffers from poison.`);
            }
            break;
        }
    }
}
DescriptionSystem.getDefaultElement = () => {
    return document.getElementById("log");
}
