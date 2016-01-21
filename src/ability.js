import {VectorChooser} from './vector_chooser.js';
import {initializeDefaultDrawer, getDefaultDrawer}  from './drawer.js';
import * as Action from './action.js';
import * as Component from './component.js';
import * as Config from './config.js';

var jumpChooser;

$(() => {
    initializeDefaultDrawer(Config.WIDTH, Config.HEIGHT, document.getElementById(Config.CANVAS_NAME));
    var transparent = 'rgba(0, 0, 0, 0)';
    var lightYellow = 'rgba(255, 255, 0, 0.25)';
    var yellow = 'rgba(255, 255, 0, 1)';
    jumpChooser = new VectorChooser(yellow, true, lightYellow, transparent, true, transparent, true);
});

export async function jumpAbility(level, entity) {
    try {
        if (this.entity.hasComponent(Component.Name)) {
            level.print(`[${this.entity.Name.fullName}] Jump to where?`);
        }
        var path = await jumpChooser.getPath(entity.Position.coordinates, entity);
        return new Action.ActionPair(new Action.Jump(entity, path), new Action.EnterCooldown(this.entity, 2+Math.floor(path.length/2)));
    } catch (e) {
        throw e;
        return null;
    }
}

export async function antAbility(level, entity) {
    return new Action.ActionPair(new Action.CallFunction(() => {
        entity.addComponent(new Component.CanPush().makeTemporary(11, 'Your ant-like strength subsides.').setDisplayable('Ant-like Strength'));
    }, entity, `[${this.entity.Name.fullName}] You gain ant-like strength.`), new Action.EnterCooldown(this.entity, 15));
}
