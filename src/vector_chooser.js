import {getDefaultDrawer} from './drawer.js';
import {getKeyCode} from './input.js';
import {Directions, DirectionVectors} from './direction.js';
import {Path} from './path.js';
import {InputCancelled} from './exception.js';

const KeyCodes = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Cancel: 27,
    Enter: 13
}

export class VectorChooser {
    constructor(selectionColour, showPath, pathColour, startColour,
        showFollowing = false, followingColour = null, drawUntilSolid = false) {

        this.selectionColour = selectionColour;
        this.showPath = showPath;
        this.pathColour = pathColour;
        this.startColour = startColour;
        this.showFollowing = showFollowing;
        this.followingColour = followingColour;
        this.drawUntilSolid = drawUntilSolid;
        
        this.drawer = getDefaultDrawer();

        if (this.showPath) {
            if (drawUntilSolid) {
                this.draw = (start, selection, character) => {
                    this.drawPathUntilSolid(start, selection, character);
                }
            } else {
                this.draw = (start, selection) => {
                    this.drawPath(start, selection);
                };
            }
        } else {
            this.draw = (start, selection) => {
                this.drawCursor(selection);
            };
        }
    }

    drawCursor(selection) {
        this.drawer.drawWithCursor(selection.x, selection.y, this.selectionColour);
    }

    drawPath(start, selection) {
        this.drawer.drawWithPath(
            new Path(start, selection),
            this.pathColour,
            this.startColour,
            this.selectionColour,
            this.showFollowing,
            this.followingColour
        );
    }

    drawPathUntilSolid(start, selection, character) {
        this.drawer.drawWithPathUntilSolid(
            new Path(start, selection),
            character,
            this.pathColour,
            this.startColour,
            this.selectionColour,
            this.showFollowing,
            this.followingColour
        );
    }
}

VectorChooser.prototype.getPath = async function(start, character) {
    var current = start;
    while (true) {
        this.draw(start, current, character);
        var code = await getKeyCode();
        switch (code) {
        case KeyCodes.Up:
            current = current.add(DirectionVectors[Directions.North]);
            break;
        case KeyCodes.Down:
            current = current.add(DirectionVectors[Directions.South]);
            break;
        case KeyCodes.Left:
            current = current.add(DirectionVectors[Directions.West]);
            break;
        case KeyCodes.Right:
            current = current.add(DirectionVectors[Directions.East]);
            break;
        case KeyCodes.Cancel:
            this.drawer.draw();
            throw new InputCancelled();
            break;
        case KeyCodes.Enter:
            this.drawer.draw();
            return new Path(start, current);
        }
    }
}

VectorChooser.prototype.getVector = async function(start, character) {
    var path = await this.getPath(start, character);
    return path.end;
}
