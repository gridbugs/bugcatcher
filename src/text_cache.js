export class TextCache {
    constructor(ctx, font, cellWidth, cellHeight, xOffset, yOffset) {
        this.ctx = ctx;
        this.font = font;
        this.table = {};
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    createCanvas() {
        return document.createElement('canvas');
    }

    getCanvas(character, foreColour, backColour) {
        let key = character + foreColour + backColour;
        let canvas = this.table[key];
        if (canvas == null) {
            canvas = this.createCanvas();
            let ctx = canvas.getContext('2d');
            ctx.font = this.font;
            ctx.beginPath();
            ctx.fillStyle = backColour;
            ctx.fillRect(0, 0, this.cellWidth, this.cellHeight);
            ctx.fillStyle = foreColour;
            ctx.fillText(character, this.xOffset, this.yOffset);
            ctx.fill();

            this.table[key] = canvas;
        }
        return canvas;
    }

    drawText(character, x, y, foreColour, backColour) {
        let canvas = this.getCanvas(character, foreColour, backColour);
        this.ctx.drawImage(canvas, x, y);
    }
}
