import {mdelay} from './time.js';
import {Vec2} from './vec2.js';

import {Schedule} from './schedule.js';

import {SpacialHash} from './spacial_hash.js';
import {EntitySet, ComponentCountingEntitySet} from './entity_set.js';

import {RendererSystem} from './renderer_system.js';
import {HudSystem} from './hud_system.js';
import {DescriptionSystem} from './description_system.js';
import {CollisionSystem} from './collision_system.js';
import {ObservationSystem} from './observation_system.js';
import {DoorSystem} from './door_system.js';
import {CombatSystem} from './combat_system.js';
import {PushSystem} from './push_system.js';
import {EquipmentSystem} from './equipment_system.js';
import {CombatEventSystem} from './combat_event_system.js';

import {
    PlayerCharacter,
    Position,
    Actor
} from './component.js';

export class Level {
    constructor(width, height) {

        this.id = Level.nextId++;

        this.entities = null;
        this.entitySpacialHash = new SpacialHash(width, height, ComponentCountingEntitySet);

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
        this.combatEventSystem = new CombatEventSystem(this);
    }

    initialize(entities) {
        this.entities = new EntitySet(entities);
        this.entitySpacialHash.initialize(entities);
        for (let e of this.entities) {
            if (e.hasComponent(Position)) {
                e.Position.addToSpacialHash();
            }
            if (e.hasComponent(Actor)) {
                e.Actor.enable(this);
            }
        }
        this.observationSystem.initialize();
    }

    addEntity(entity, x, y) {
        this.entities.add(entity);
        if (entity.hasComponent(Position)) {
            entity.Position.level = this;
            entity.Position.coordinates = new Vec2(x, y);
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
        entity.Actor.scheduled = true;
        this.schedule.scheduleTask(async () => {
            entity.Actor.scheduled = false;
            await this.gameStep(entity);
        }, relativeTime);
    }

    scheduleImmediateAction(action, relativeTime = 0) {
        this.schedule.scheduleTask(async () => {
            this.applyAction(action);
            if (action.direct && relativeTime > 0 && action.entity == this.playerCharacter) {
                this.hudSystem.run(this.playerCharacter);
                this.observationSystem.run(this.playerCharacter);
                this.rendererSystem.run(this.playerCharacter);
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
    this.combatEventSystem.check(action);

    if (action.success) {
        action.commit(this);
        this.observationSystem.update(action);

        this.descriptionSystem.run(this.playerCharacter, action);

        return true;
    }
    return false;
}

Level.prototype.gameStep = async function(entity) {

    if (!entity.hasComponent(Actor) || !entity.Actor.active) {
        return;
    }

    this.observationSystem.run(entity);
    this.rendererSystem.run(entity);
    this.hudSystem.run(entity);

    var action = await entity.Actor.getAction(this, entity);

    if (entity == this.playerCharacter) {
        await mdelay(20);
    }

    if (this.applyAction(action)) {
        if (action.direct) {
            this.hudSystem.run(entity);
        }
        if (!action.shouldReschedule()) {
            return;
        }
    }
    
    entity.tickComponents(this);
    this.scheduleActorTurn(entity, action.time);
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
