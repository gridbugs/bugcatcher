import {Grid} from './grid.js';

import {Position, Tile} from './component.js';

export class RendererSystem {
    constructor(level, numCols, numRows, canvas=RendererSystem.getDefaultCanvas()) {
        this.level = level;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.fontSize = 16;
        this.xPadding = 0;
        this.yPadding = 20;
        this.xBackgroundPadding = 0;
        this.yBackgroundPadding = -12;
        this.ctx.font = `${this.fontSize}px Monospace`;
        this.cellWidth = this.ctx.measureText('@').width;
        this.cellHeight = this.fontSize;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        this.unseenColour = '#444444';
        for (let [i, j] of this.grid.coordinates()) {
            this.grid.set(j, i, {seq: 0, entity: null, current: false});
        }
        this.seq = 0;
    }

    run(entity) {

        var memory = entity.Memory;

        ++this.seq;

        this.ctx.beginPath();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let entity of memory.lastSeenTimes.iterateEntities(this.level)) {
            let lastSeenTime = memory.lastSeenTimes.get(this.level, entity);
            if (entity.hasComponents(Position, Tile)) {
                let vec = entity.Position.vec;
                let entry = this.grid.getCart(vec);

                if (entry.seq != this.seq || entry.entity == null ||
                    entry.entity.Tile.zIndex < entity.Tile.zIndex) {

                    entry.entity = entity;
                    entry.seq = this.seq;
                    entry.current = lastSeenTime == this.level.time;
                }
            }
        }

        for (let entry of this.grid) {
            let entity = entry.entity;
            if (entity != null && entry.seq == this.seq) {
                let vec = entity.Position.vec;
                let colour;
                let backgroundColour;
                if (entry.current) {
                    colour = entity.Tile.colour;
                    backgroundColour = entity.Tile.backgroundColour;
                    if (backgroundColour == null) {
                        backgroundColour = 'rgba(0, 0, 0, 0)';
                    }
                } else {
                    backgroundColour = entity.Tile.backgroundColour;
                    if (backgroundColour == null) {
                        backgroundColour = 'rgba(0, 0, 0, 0)';
                        colour = this.unseenColour;
                    } else {
                        colour = 'black';
                        backgroundColour = this.unseenColour;
                    }

                }
                this.ctx.fillStyle = backgroundColour;

                let x = vec.x * this.cellWidth + this.xPadding;
                let y = vec.y * this.cellHeight + this.yPadding;

                this.ctx.fillRect(x + this.xBackgroundPadding, y + this.yBackgroundPadding, this.cellWidth, this.cellHeight);
                this.ctx.fillStyle = colour;
                this.ctx.fillText(entity.Tile.character, x, y);
            }
        }

        this.ctx.fill();
    }
}
RendererSystem.getDefaultCanvas = () => {
    return document.getElementById('canvas');
}
