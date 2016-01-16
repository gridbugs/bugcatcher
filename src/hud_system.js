import {getStatistic} from './statistics.js';

import {
    Health,
    Armour
} from './component.js';

export class HudSystem {
    constructor(level, element=HudSystem.getDefaultElement()) {
        this.level = level;
        this.$element = $(element);
    }

    formatStatistic(entity, stat, name) {
        let value = getStatistic(entity, stat);
        return `<span class="statistic"><span class="name">${name}</span>: <span class="value">${value}</span></span>`;
    }

    run(entity) {
        this.$element.empty();
        this.$element.append([
            this.formatStatistic(entity, Health, 'Health'),
            this.formatStatistic(entity, Armour, 'Armour')
        ].join('<span class="space">&nbsp;&nbsp;</span>'));
    }

}
HudSystem.getDefaultElement = () => {
    return document.getElementById('hud');
}
