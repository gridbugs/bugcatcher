import {Grid} from './grid.js';

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
            this.grid.set(j, i, new DrawerCell(j, i));
        }
        this.seq = 0;

        this.defaultBackgroundColour = "black";
        this.defaultColour = "white";
        this.transparentColour = "rgb(0, 0, 0, 0)";
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
                let x = cell.x * this.cellWidth + this.xPadding;
                let y = cell.y * this.cellHeight + this.yPadding;
                this.ctx.fillRect(x + this.xBackgroundPadding, y + this.yBackgroundPadding, this.cellWidth, this.cellHeight);
                this.ctx.fillStyle = cell.colour;
                this.ctx.fillText(cell.character, x, y);
            }
        }
        
        this.ctx.fill();
    }
}
export function initializeDefaultDrawer(numCols, numRows, canvas) {
    Drawer.defaultDrawer = new Drawer(numCols, numRows, canvas);
}
export function getDefaultDrawer() {
    return Drawer.defaultDrawer;
}
