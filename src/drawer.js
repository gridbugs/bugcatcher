import {Grid} from './grid.js';
import {Solid} from './component.js';

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
        this.yPadding = 20;
        this.xBackgroundPadding = 0;
        this.yBackgroundPadding = -12;
        this.ctx.font = `${this.fontSize}px Monospace`;
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
    }

    transformBackgroundX(x) {
        return x * this.cellWidth + this.xPadding + this.xBackgroundPadding;
    }
    
    transformBackgroundY(y) {
        return y * this.cellHeight + this.yPadding + this.yBackgroundPadding;
    }

    begin() {
        ++this.seq;
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
                this.ctx.fillStyle = cell.backgroundColour;
                this.ctx.fillRect(cell.x + this.xBackgroundPadding, cell.y + this.yBackgroundPadding,
                    this.cellWidth, this.cellHeight);
                this.ctx.fillStyle = cell.colour;
                this.ctx.fillText(cell.character, cell.x, cell.y);
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
                this.ctx.fillRect(cell.x + this.xBackgroundPadding, cell.y + this.yBackgroundPadding,
                    this.cellWidth, this.cellHeight);
            }
        }
    }

    _drawForeground() {
        for (let cell of this.grid) {
            if (cell.seq == this.seq) {
                this.ctx.fillStyle = cell.colour;
                this.ctx.fillText(cell.character, cell.x, cell.y);
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
            for (let entity of cell) {
                if (entity.hasComponent(Solid)) {
                    solid = true;
                    break;
                }
                let lastSeenTime = memory.lastSeenTimes.get(level, entity);
                if (lastSeenTime != level.turn) {
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
                let cell = level.entitySpacialHash.getCart(vec);
                for (let entity of cell) {
                    if (entity.hasComponent(Solid)) {
                        solid = true;
                        break;
                    }
                    let lastSeenTime = memory.lastSeenTimes.get(level, entity);
                    if (lastSeenTime != level.turn) {
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
    Drawer.defaultDrawer = new Drawer(numCols, numRows, canvas);
}
export function getDefaultDrawer() {
    return Drawer.defaultDrawer;
}
