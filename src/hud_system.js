import {getStatistic} from './statistics.js';

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
        var inventoryItem;
        if (item == null) {
            inventoryItem = "";
        } else {
            inventoryItem = `
                <div class="inventory-item">
                    <div class="inventory-item-image">
                        <span style="color:${item.Tile.colour}">${item.Tile.character}</span>
                    </div>
                    <div class="inventory-item-name">${item.Name.shortName}</div>
                </div>
            `;
        }
        return `
            <div class="inventory-slot">
                <div class="inventory-slot-number">${index}</div>
                ${inventoryItem}
            </div>
        `;
    }

    run(entity) {
        this.$element.empty();
        this.$element.append([
            this.formatStatistic(entity, Health, 'Health'),
            this.formatStatistic(entity, Armour, 'Armour')
        ].join('<span class="space">&nbsp;&nbsp;</span>'));
        
        this.$inventoryContainer.empty();
        for (let [index, item] of entity.Inventory.inventory) {
            this.$inventoryContainer.append(this.formatInventorySlot(index, item));
        }

    }

}
