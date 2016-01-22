import {Grid} from './grid.js';
import {getDefaultDrawer} from './drawer.js';

import {Position, Tile, PlayerCharacter} from './component.js';

export class RendererSystem {
    constructor(level, numCols, numRows, drawer = getDefaultDrawer()) {
        this.level = level;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        this.unseenColour = '#444444';
        for (let [i, j] of this.grid.coordinates()) {
            this.grid.set(j, i, {seq: 0, entity: null, current: false});
        }
        this.seq = 0;

        this.drawer = drawer;
    }

    run(entity) {

        if (!entity.hasComponent(PlayerCharacter)) {
            return;
        }

        var memory = entity.Memory;

        ++this.seq;
        
        for (let memoryCell of memory.value.iterateCells(this.level)) {
            let lastSeenTime = memoryCell.turn;
            for (let entity of memoryCell) {
                if (entity.hasComponent(Position) && entity.hasComponent(Tile)) {
                    let vec = entity.Position.coordinates;
                    let entry = this.grid.getCart(vec);

                    if (entry.seq != this.seq || entry.entity == null ||
                        entry.entity.Tile.zIndex < entity.Tile.zIndex) {

                        entry.entity = entity;
                        entry.seq = this.seq;
                        entry.current = lastSeenTime == this.level.turn;
                    }
                }
            }
        }

        this.drawer.begin();
        for (let entry of this.grid) {
            let entity = entry.entity;
            if (entity != null && entry.seq == this.seq) {
                let vec = entity.Position.coordinates;
                let colour;
                let backgroundColour = null;
                if (entry.current) {
                    colour = entity.Tile.colour;
                    backgroundColour = entity.Tile.backgroundColour;
                } else {
                    if (entity.Tile.backgroundColour == null) {
                        colour = this.unseenColour;
                    } else {
                        colour = 'black';
                        backgroundColour = this.unseenColour;
                    }
                }
                this.drawer.setTile(vec.x, vec.y, entity.Tile.character, colour, backgroundColour);
            }
        }
        this.drawer.draw();

    }
}
