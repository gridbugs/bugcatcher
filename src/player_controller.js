import {getKey, getChar} from './input.js';
import {Directions, CardinalDirectionVectors} from './direction.js';
import * as Action from './action.js';
import * as Component from './component.js';

const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Close: 67,
    DownStairs: 190,
    UpStairs: 188,
    Ability: 65,
    Jump: 66,
    Get: 71,
    Drop: 68,
    Wait: 190,
    Equip: 69,
    Unequip: 82
}

export async function getPlayerAction(level, entity) {
    while (true) {
        var key = await getKey();
        switch (key.keyCode) {
        case KeyCodes.Up:
            return new Action.Walk(entity, Directions.North);
        case KeyCodes.Down:
            return new Action.Walk(entity, Directions.South);
        case KeyCodes.Left:
            return new Action.Walk(entity, Directions.West);
        case KeyCodes.Right:
            return new Action.Walk(entity, Directions.East);
        case KeyCodes.Close:
            var action = closeDoor(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.DownStairs:
        case KeyCodes.Wait:
            if (key.shiftKey) {
                var action = descendStairs(level, entity);
                if (action != null) {
                    return action;
                }
            } else {
                return new Action.Wait(entity);
            }
            break;
        case KeyCodes.UpStairs:
            if (key.shiftKey) {
                var action = ascendStairs(level, entity);
                if (action != null) {
                    return action;
                }
            }
            break;
        case KeyCodes.Ability:
            var action = await useAbility(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Jump:
            var action = await jumpAbility(level, entity);
            if (action != null) {
                return action;
            }
           break;
        case KeyCodes.Get:
            var action = getItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Drop:
            var action = await dropItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Equip:
            var action = await equipItem(level, entity);
            if (action != null) {
                return action;
            }
            break;
        case KeyCodes.Unequip:
            if (entity.EquipmentSlot.item != null) {
                return new Action.UnequipItem(entity);
            }
            break;
        }
    }
}

function closeDoor(level, entity) {
    for (let cell of level.entitySpacialHash.iterateNeighbours(entity.Position.coordinates, CardinalDirectionVectors)) {
        for (let e of cell) {
            if (e.hasComponent(Component.Door) && e.Door.open) {
                return new Action.CloseDoor(entity, e);
            }
        }
    }
    return null;
}

function ascendStairs(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(Component.UpStairs)) {
            return new Action.Ascend(entity, e);
        }
    }
}
function descendStairs(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(Component.DownStairs)) {
            return new Action.Descend(entity, e);
        }
    }
}

function getItem(level, entity) {
    var cell = level.entitySpacialHash.getCart(entity.Position.coordinates);
    for (let e of cell) {
        if (e.hasComponent(Component.Getable)) {
            return new Action.GetItem(entity, e);
        }
    }
}

async function dropItem(level, entity) {
    level.descriptionSystem.printMessage("Drop from which slot (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item != null) {
            return new Action.DropItem(entity, index);
        } else {
            level.descriptionSystem.printMessage(`No item in slot ${index}.`);
        }
    } else {
        level.descriptionSystem.printMessage("Ignoring");
    }
}

async function equipItem(level, entity) {
    level.descriptionSystem.printMessage("Channel from which slot (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item != null) {
            return new Action.EquipItem(entity, item);
        } else {
            level.descriptionSystem.printMessage(`No item in slot ${index}.`);
        }
    } else {
        level.descriptionSystem.printMessage("Ignoring");
    }
}

async function useAbility(level, entity) {
    level.descriptionSystem.printMessage("Which ability (1-8)?");
    var index = parseInt(await getChar());
    if (index >= 1 && index <= 8) {
        var item = entity.Inventory.inventory.get(index);
        if (item == null) {
            level.descriptionSystem.printMessage(`Slot ${index} is empty.`);
        } else if (!item.hasComponent(Component.Ability)) {
            level.descriptionSystem.printMessage(`The ${item.Name.fullName} has no ability.`);
        } else if (item.hasComponent(Component.Cooldown)) {
            level.print('This item is cooling down.');
        } else {
            try {
                var action = await item.Ability.getAction(level, entity);
                if (entity.EquipmentSlot.item == item) {
                    return new Action.ActionPair(new Action.UnequipItem(entity), action);
                } else {
                    return action;
                }
            } catch (e) {
                level.descriptionSystem.printMessage("Ignoring");
            }
        }
    } else {
        level.descriptionSystem.printMessage("Ignoring");
    }
}
