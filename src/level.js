import {mdelay} from './time.js';

import {Schedule} from './schedule.js';

import {SpacialHash} from './spacial_hash.js';
import {EntitySet} from './entity_set.js';

import {RendererSystem} from './renderer_system.js';
import {HudSystem} from './hud_system.js';
import {DescriptionSystem} from './description_system.js';
import {CollisionSystem} from './collision_system.js';
import {ObservationSystem} from './observation_system.js';
import {DoorSystem} from './door_system.js';
import {CombatSystem} from './combat_system.js';
import {PushSystem} from './push_system.js';
import {EquipmentSystem} from './equipment_system.js';

import {PlayerCharacter, Position} from './component.js';

export class Level {
    constructor(width, height, entities) {

        this.id = Level.nextId++;

        this.entities = new EntitySet().initialize(entities);
        this.entitySpacialHash = new SpacialHash(width, height, EntitySet).initialize(entities);

        this.width = width;
        this.height = height;

        this.schedule = new Schedule();

        this.rendererSystem = new RendererSystem(this, width, height);
        this.descriptionSystem = new DescriptionSystem(this);
        this.hudSystem = new HudSystem(this);
        this.collisionSystem = new CollisionSystem(this);
        this.observationSystem = new ObservationSystem(this, width, height);
        this.doorSystem = new DoorSystem(this);
        this.combatSystem = new CombatSystem(this);
        this.pushSystem = new PushSystem(this);
        this.equipmentSystem = new EquipmentSystem(this);
    }

    addEntity(entity, x, y) {
        this.entities.add(entity);
        if (entity.hasComponent(Position)) {
            entity.Position.level = this;
        } else {
            entity.addComponent(new Position(x, y, this));
        }
    }

    deleteEntity(entity) {
        this.entities.delete(entity);
        if (entity.hasComponent(Position)) {
            entity.removeComponent(Position);
        }
    }

    setPlayerCharacter(playerCharacter) {
        this.playerCharacter = playerCharacter;
    }

    scheduleActorTurn(entity, relativeTime = 1) {
        this.schedule.scheduleTask(async () => {
            await this.gameStep(entity);
        }, relativeTime);
    }

    scheduleImmediateAction(action, relativeTime = 0) {
        this.schedule.scheduleTask(async () => {
            this.applyAction(action);
            if (action.direct && relativeTime > 0) {
                this.rendererSystem.run(this.playerCharacter);
                this.hudSystem.run(this.playerCharacter);
                await mdelay(relativeTime);
            }
        }, relativeTime, /* immediate */ true);
    }

    get time() {
        return this.schedule.absoluteTime;
    }
    get turn() {
        return this.schedule.sequenceNumber;
    }

    print(string) {
        this.descriptionSystem.printMessage(string);
    }
}
Level.nextId = 0;

Level.prototype.applyAction = function(action) {
    this.collisionSystem.check(action);
    this.doorSystem.check(action);
    this.combatSystem.check(action);
    this.pushSystem.check(action);
    this.equipmentSystem.check(action);

    if (action.success) {
        action.commit(this);

        this.descriptionSystem.run(this.playerCharacter, action);

        return true;
    }
    return false;
}

Level.prototype.gameStep = async function(entity) {
    this.observationSystem.run(entity);
    this.rendererSystem.run(entity);
    this.hudSystem.run(entity);

    var action = await entity.Actor.getAction(this, entity);

    await mdelay(1);

    if (this.applyAction(action)) {
        if (action.direct) {
            this.observationSystem.run(entity);
            this.rendererSystem.run(entity);
            this.hudSystem.run(entity);
        }
        if (!action.shouldReschedule()) {
            return;
        }
    }
    
    entity.tickComponents(this);
    this.scheduleActorTurn(entity);
}

Level.prototype.progressSchedule = async function() {
    var entry = this.schedule.pop();
    await entry.task();
}

Level.prototype.registerPeriodicFunction = function(fn, period) {
    this.schedule.scheduleTask(async () => {
        if (await fn(this)) {
            this.registerPeriodicFunction(fn, period);
        }
    }, period);
}

Level.prototype.flushImmediate = async function() {
    while (this.schedule.hasImmediateTasks()) {
        await this.progressSchedule();
    }
}
