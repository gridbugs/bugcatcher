import {Grid} from './grid.js';
import {Solid} from './component.js';
import {TextCache} from './text_cache.js'

class DrawerCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.character = null;
        this.colour = null;
        this.backgroundColour = null;
        this.seq = 0;
    }
}

export class Drawer {
    constructor(numCols, numRows, canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.fontSize = 16;
        this.xPadding = 0;
        this.yPadding = 4;
        this.font =`${this.fontSize}px Monospace`;
        this.ctx.font = this.font;
        this.cellWidth = this.ctx.measureText('@').width;
        this.cellHeight = this.fontSize;
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new Grid(this.numCols, this.numRows);
        for (let [i, j] of this.grid.coordinates()) {
            let x = j * this.cellWidth + this.xPadding;
            let y = i * this.cellHeight + this.yPadding;
            this.grid.set(j, i, new DrawerCell(x, y));
        }
        this.seq = 0;

        this.defaultBackgroundColour = "black";
        this.defaultColour = "white";
        this.transparentColour = "rgb(0, 0, 0, 0)";
        this.defaultUiColour = "yellow";
        this.textCache = new TextCache(
            this.ctx,
            this.font,
            this.cellWidth,
            this.cellHeight,
            0,
            13
        );
    }

    transformBackgroundX(x) {
        return x * this.cellWidth + this.xPadding;
    }
    
    transformBackgroundY(y) {
        return y * this.cellHeight + this.yPadding;
    }

    begin() {
        ++this.seq;
    }

    drawTile(cell, colour = 'rgba(255, 0, 0, 0.25') {
        this.ctx.beginPath();
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(cell.x * this.cellWidth + this.xPadding, cell.y * this.cellHeight + this.yPadding, this.cellWidth, this.cellHeight);
        this.ctx.fill();
    }

    setTile(x, y, character, colour, backgroundColour) {
        let cell = this.grid.get(x, y);
        cell.seq = this.seq;
        cell.character = character;
        cell.colour = colour || this.defaultColour;
        cell.backgroundColour = backgroundColour || this.defaultBackgroundColour;
    }

    draw() {
        this.ctx.beginPath();

        // clear the canvas
        this.ctx.fillStyle = this.defaultBackgroundColour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw each cell
        for (let cell of this.grid) {
            if (cell.seq == this.seq) {
                this.textCache.drawText(cell.character, cell.x, cell.y, cell.colour, cell.backgroundColour);
            }
        }
        
        this.ctx.fill();
    }

    _prepare() {
        this.ctx.beginPath();

        // clear the canvas
        this.ctx.fillStyle = this.defaultBackgroundColour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _drawBackground() {
        for (let cell of this.grid) {
            if (cell.seq == this.seq) {
                this.ctx.fillStyle = cell.backgroundColour;
                this.ctx.fillRect(cell.x, cell.y,
                    this.cellWidth, this.cellHeight);
            }
        }
    }

    _drawForeground() {
        for (let cell of this.grid) {
            if (cell.seq == this.seq) {
                this.ctx.fillStyle = cell.colour;
                this.ctx.fillText(cell.character, cell.x, cell.y + 13);
            }
        }
    }

    _complete() {
        this.ctx.fill();
    }

    drawWithCursor(cursorX, cursorY, cursorColour = this.defaultUiColour) {
        this._prepare();
        this._drawBackground();

        this.ctx.fillStyle = cursorColour;
        this.ctx.fillRect(this.transformBackgroundX(cursorX), this.transformBackgroundY(cursorY),
                            this.cellWidth, this.cellHeight);

       this._drawForeground();
       this._complete();
    }

    drawWithPathUntilSolid(path, character, pathColour, startColour, endColour,
                                drawFollowing = false, followingColour = null) {
        var level = character.Position.level;
        var memory = character.Memory;

        this._prepare();
        this._drawBackground();

        pathColour = pathColour || this.defaultUiColour;

        this.ctx.fillStyle = pathColour;
        let solid = false;
        for (let vec of path.iterateAbsolute()) {
            let cell = level.entitySpacialHash.getCart(vec);
            let memoryCell = memory.value.getCart(level, vec);
            if (memoryCell.turn != level.turn) {
                solid = true;
                break;
            }

            for (let entity of cell) {
                if (entity.hasComponent(Solid)) {
                    solid = true;
                    break;
                }
            }
            if (solid) {
                break;
            }
            this.ctx.fillRect(this.transformBackgroundX(vec.x), this.transformBackgroundY(vec.y),
                                this.cellWidth, this.cellHeight);
        }

        if (drawFollowing && !solid) {
            this.ctx.fillStyle = followingColour || pathColour;
            for (let vec of path.iterateFollowing()) {
                if (!this.grid.hasCoordinateCart(vec)) {
                    break;
                }
                let memoryCell = memory.value.getCart(level, vec);
                if (memoryCell.turn != level.turn) {
                    solid = true;
                    break;
                }
                let cell = level.entitySpacialHash.getCart(vec);
                for (let entity of cell) {
                    if (entity.hasComponent(Solid)) {
                        solid = true;
                        break;
                    }
                }
                if (solid) {
                    break;
                }
                this.ctx.fillRect(this.transformBackgroundX(vec.x), this.transformBackgroundY(vec.y),
                                    this.cellWidth, this.cellHeight);
            }


        }

        this.ctx.fillStyle = startColour || pathColour;
        this.ctx.fillRect(this.transformBackgroundX(path.start.x), this.transformBackgroundY(path.start.y),
                            this.cellWidth, this.cellHeight);
        
        this.ctx.fillStyle = endColour || pathColour;
        this.ctx.fillRect(this.transformBackgroundX(path.end.x), this.transformBackgroundY(path.end.y),
                            this.cellWidth, this.cellHeight);
        this._drawForeground();
        this._complete();
    }

    drawWithPath(path, pathColour, startColour, endColour,
                drawFollowing = false, followingColour = null) {

        this._prepare();
        this._drawBackground();

        pathColour = pathColour || this.defaultUiColour;
        
        this.ctx.fillStyle = pathColour;
        for (let vec of path.iterateAbsolute()) {
            this.ctx.fillRect(this.transformBackgroundX(vec.x), this.transformBackgroundY(vec.y),
                                this.cellWidth, this.cellHeight);
        }

        this.ctx.fillStyle = startColour || pathColour;
        this.ctx.fillRect(this.transformBackgroundX(path.start.x), this.transformBackgroundY(path.start.y),
                            this.cellWidth, this.cellHeight);
        
        this.ctx.fillStyle = endColour || pathColour;
        this.ctx.fillRect(this.transformBackgroundX(path.end.x), this.transformBackgroundY(path.end.y),
                            this.cellWidth, this.cellHeight);

        if (drawFollowing) {
            this.ctx.fillStyle = followingColour || pathColour;
            for (let vec of path.iterateFollowing()) {
                if (!this.grid.hasCoordinateCart(vec)) {
                    break;
                }
                this.ctx.fillRect(this.transformBackgroundX(vec.x), this.transformBackgroundY(vec.y),
                                    this.cellWidth, this.cellHeight);
            }
        }

        this._drawForeground();
        this._complete();
    }
}
export function initializeDefaultDrawer(numCols, numRows, canvas) {
    if (Drawer.defaultDrawer == undefined) {
        Drawer.defaultDrawer = new Drawer(numCols, numRows, canvas);
    }
}
export function getDefaultDrawer() {
    return Drawer.defaultDrawer;
}
