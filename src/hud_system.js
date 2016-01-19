import {getStatistic} from './statistics.js';
import {
    Ability,
    Cooldown
} from './component.js';

import {
    Health,
    Defence,
    Attack,
    Accuracy,
    Dodge
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
            var statistics = [];
            if (item.hasComponent(Health)) {
                statistics.push(`
                    <div>
                        <span class="name">Health:</span>
                        <span class="value">${item.Health.value}/${item.Health.maxValue}</span>
                    </div>
                `);
            }
            if (item.hasComponent(Attack)) {
                statistics.push(`
                    <div>
                        <span class="name">Attack:</span>
                        <span class="value">${item.Attack.value}</span>
                    </div>
                `);
            }
            if (item.hasComponent(Defence)) {
                statistics.push(`
                    <div>
                        <span class="name">Defence:</span>
                        <span class="value">${item.Defence.value}</span>
                    </div>
                `);
            }
            if (item.hasComponent(Accuracy)) {
                statistics.push(`
                    <div>
                        <span class="name">Accuracy:</span>
                        <span class="value">${item.Accuracy.value}</span>
                    </div>
                `);
            }
            if (item.hasComponent(Dodge)) {
                statistics.push(`
                    <div>
                        <span class="name">Dodge:</span>
                        <span class="value">${item.Dodge.value}</span>
                    </div>
                `);
            }
 
            statistics = statistics.join('');

            if (item.hasComponent(Ability) && item.hasComponent(Cooldown)) {
                inventoryCooldown = '<div class="inventory-slot-cooldown"></div>';
                inventoryStatus = `<div class="inventory-slot-status" style="font-size:12px">cooldown(${item.Cooldown.ticksRemaining})</div>`;
            } else {
                inventoryStatus = `<div class="inventory-slot-status">ready</div>`;
            }
            inventoryItem = `
                <div class="inventory-slot-item">
                    <div class="inventory-item-image">
                        <span style="color:${item.Tile.colour}">${item.Tile.character}</span>
                    </div>
                    <div class="inventory-item-name">${item.Name.shortName}</div>
                    <div class="inventory-slot-statistics">${statistics}</div>
                    ${inventoryCooldown}
                </div>
            `;
        }
        return `
            <div class="inventory-slot">
                <div class="inventory-slot-number">${index}.</div>
                <div class="inventory-slot-status-container">
                ${inventoryStatus}
                </div>
                ${inventoryItem}
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
