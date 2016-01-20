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
    Dodge,
    PlayerCharacter
} from './component.js';

const STATISTICS = [Attack, Defence, Accuracy, Dodge];

export class HudSystem {
    constructor(level) {
        this.level = level;
        this.$element = $('#hud');
        this.$hudTitle = $('#hud-title');
        this.$hudStatistics = $('#hud-statistics');
        this.$hudHealth = $('#hud-health');
        this.$hudModifiers = $('#hud-modifiers');
        this.$inventoryContainer = $('#inventory-container');
    }

    formatStatistic(entity, stat, name) {
        let value = getStatistic(entity, stat);
        return `<span class="statistic"><span class="name">${name}</span>: <span class="value">${value}</span></span>`;
    }

    formatInventorySlot(entity, index, item) {
        var inventoryItem = "";
        var inventoryCooldown = "";
        var inventoryStatus = "";
        var equipped = "";
        if (item != null) {

            if (entity.Equipper.item == item) {
                equipped = '<div class="inventory-slot-equipped"></div>';
            }

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
                </div>
                ${inventoryCooldown}
            `;
        }
        return `
            <div class="inventory-slot">
                ${equipped}
                ${inventoryItem}
                <div class="inventory-slot-number">${index}.</div>
                <div class="inventory-slot-status-container">
                ${inventoryStatus}
                </div>
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

    formatBaseStatistics(entity) {
        let arr = [];
        for (let s of STATISTICS) {
            let c = entity.getComponent(s);
            arr.push(`
                <div class="statistic" style="margin-right:60px"><span class="name">${c.name}:</span><span class="value">
                    <span class="total">${c.value}</span>
                </span></div>
            `);
        }
        return arr.join('');
    }

    formatEquippedStatistics(entity, item) {
        let arr = [];
        for (let s of STATISTICS) {
            let baseComponent = entity.getComponent(s);
            let itemComponent = item.getComponent(s);
            let total = getStatistic(entity, s);
            arr.push(`
                <div class="statistic"><span class="name">${baseComponent.name}:</span><span class="value">
                    <span class="total">${total}</span>
                    <span class="sum">(${baseComponent.value} + ${itemComponent.value})</span>
                </span></div>
            `);
        }
        return arr.join('');
 
    }

    run(entity) {
        if (!entity.hasComponent(PlayerCharacter)) {
            return;
        }
        this.$hudHealth.empty();
        this.$hudHealth.append(`<span class="name">Health:</span>
                                <span class="value">${entity.Health.value}/${entity.Health.maxValue}</span>`);

        this.$hudModifiers.empty();
        var modifiers = [];
        for (let c of entity.iterateComponents()) {
            if (c.displayable) {
                modifiers.push(this.formatModifier(entity, c));
            }
        }
        this.$hudModifiers.append(modifiers.join(', '));

        this.$hudTitle.empty();
        this.$hudTitle.append(`<span id="hud-title-player">${entity.Name.fullName}</span>`);

        this.$hudStatistics.empty();
        if (entity.Equipper.item == null) {
            this.$hudStatistics.append(this.formatBaseStatistics(entity));
        } else {
            this.$hudTitle.append(`<span id="hud-title-plus"> + </span><span id="hud-title-equipped">
                                    ${entity.Equipper.item.Name.shortName}</span></div>`);
            this.$hudStatistics.append(this.formatEquippedStatistics(entity, entity.Equipper.item));
        }

        this.$inventoryContainer.empty();
        for (let [index, item] of entity.Inventory.inventory) {
            this.$inventoryContainer.append(this.formatInventorySlot(entity, index, item));
        }

    }

}
