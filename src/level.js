import {mdelay} from './time.js';

import {Schedule} from './schedule.js';

import {SpacialHash} from './spacial_hash.js';

import {EntityMap, EntitySet} from './entity.js';
import {IdMap} from './id_map.js';

import {RendererSystem} from './renderer_system.js';
import {CollisionSystem} from './collision_system.js';
import {ObservationSystem} from './observation_system.js';
import {DoorSystem} from './door_system.js';

export class Level {
    constructor(width, height, entities) {

        this.id = Level.nextId++;

        this.entities = new EntitySet(entities);
        this.entitySpacialHash = new SpacialHash(width, height, EntityMap).initialize(entities);

        this.width = width;
        this.height = height;

        this.schedule = new Schedule();

        this.rendererSystem = new RendererSystem(this, width, height);
        this.collisionSystem = new CollisionSystem(this, this.entities, width, height);
        this.observationSystem = new ObservationSystem(this, this.entities, width, height);
        this.doorSystem = new DoorSystem(this, this.entities, width, height);
    }

    scheduleActorTurn(entity, relativeTime = 1) {
        this.schedule.scheduleTask(async () => {
            await this.gameStep(entity);
        }, relativeTime);
    }

    scheduleImmediateAction(action, relativeTime = 1) {
        this.schedule.scheduleTask(() => {
            this.applyAction(action);
        }, relativeTime, /* immediate */ true);
    }

    applyAction(action) {
        this.collisionSystem.check(action);
        this.doorSystem.check(action);

        if (action.success) {
            action.commit();

            this.collisionSystem.update(action);
            this.observationSystem.update(action);
            this.doorSystem.update(action);
            return true;
        }
        return false;
    }

    get time() {
        return this.schedule.absoluteTime;
    }
}
Level.nextId = 0;

Level.prototype.gameStep = async function(entity) {
    this.observationSystem.run(entity);
    this.rendererSystem.run(entity);

    var action = await entity.Actor.getAction(this, entity);

    await mdelay(1);

    if (this.applyAction(action) && !action.shouldReschedule()) {
        return;
    }

    this.scheduleActorTurn(entity);
}

Level.prototype.progressSchedule = async function() {
    await this.schedule.pop().task();
}

Level.prototype.flushImmediate = async function() {
    while (this.schedule.hasImmediateTasks()) {
        await this.progressSchedule();
    }
}

export class LevelMap extends IdMap {
    constructor() {
        super(Level);
    }
    *levels() {
        yield* this.keys();
    }
}
