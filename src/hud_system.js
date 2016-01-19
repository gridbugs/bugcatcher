import {getStatistic} from './statistics.js';
import {
    Ability
} from './component.js';

import {
    Health,
    Armour
} from './component.js';

export class HudSystem {
    constructor(level) {
        this.level = level;
        this.$element = $('#hud');
        this.$inventoryContainer = $('#inventory-container');
    }

    formatStatistic(entity, stat, name) {
        let value = getStatistic(entity, stat);
        return `<span class="statistic"><span class="name">${name}</span>: <span class="value">${value}</span></span>`;
    }

    formatInventorySlot(index, item) {
        var inventoryItem = "";
        var inventoryCooldown = "";
        var inventoryStatus = "";
        if (item != null) {
            inventoryItem = `
                <div class="inventory-item">
                    <div class="inventory-item-image">
                        <span style="color:${item.Tile.colour}">${item.Tile.character}</span>
                    </div>
                    <div class="inventory-item-name">${item.Name.shortName}</div>
                </div>
            `;
            if (item.hasComponent(Ability) && item.Ability.coolingDown) {
                inventoryCooldown = '<div class="inventory-slot-cooldown"></div>';
                inventoryStatus = `<div class="inventory-slot-status">(${item.Ability.cooldownTime})</div>`;
            }
        }
        return `
            <div class="inventory-slot">
                ${inventoryItem}
                ${inventoryCooldown}
                <div class="inventory-slot-number">${index}</div>
                ${inventoryStatus}
            </div>
        `;
    }

    formatModifier(entity, component) {
        let remainingTime = "";
        if (component.temporary) {
            remainingTime = ` (${component.ticksRemaining})`;
        }
        return `<span class="modifier">${component.displayName}${remainingTime}</span>`;
    }

    run(entity) {
        this.$element.empty();
        this.$element.append('<div>');
        this.$element.append([
            this.formatStatistic(entity, Health, 'Health'),
        ].join('<span class="space">&nbsp;&nbsp;</span>'));
        this.$element.append('</div>');
        this.$element.append('<div>');
        var modifiers = [];
        for (let c of entity.iterateComponents()) {
            if (c.displayable) {
                modifiers.push(this.formatModifier(entity, c));
            }
        }
        this.$element.append(modifiers.join('<span class="space">&nbsp;&nbsp;</span>'));
        this.$element.append('</div>');
        
        this.$inventoryContainer.empty();
        for (let [index, item] of entity.Inventory.inventory) {
            this.$inventoryContainer.append(this.formatInventorySlot(index, item));
        }

    }

}
