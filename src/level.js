import {mdelay} from './time.js';

import {Schedule} from './schedule.js';

import {Renderer} from './renderer.js';
import {Collision} from './collision.js';
import {Observation} from './observation.js';

export class Level {
    constructor(width, height, entities) {
        this.width = width;
        this.height = height;

        this.schedule = new Schedule();

        this.renderer = new Renderer(this, width, height);
        this.collision = new Collision(this, entities, width, height);
        this.observation = new Observation(this, entities, width, height);
    }

    scheduleActorTurn(entity, relativeTime = 1) {
        this.schedule.scheduleTask(async () => {
            await this.gameStep(entity);
            await mdelay(1);
            this.scheduleActorTurn(entity);
        }, relativeTime);
    }

    get time() {
        return this.schedule.absoluteTime;
    }
}

Level.prototype.gameStep = async function(entity) {
    this.observation.run(entity);
    this.renderer.run(entity);

    var action = await entity.Actor.getAction(entity);

    this.collision.check(action);

    if (action.success) {
        action.commit();

        this.collision.update(action);
        this.observation.update(action);

        this.observation.run(entity);
        this.renderer.run(entity);
    }
}

Level.prototype.gameLoop = async function() {
    while (!this.schedule.empty) {
        await this.schedule.pop().task();
    }
}
