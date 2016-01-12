export function* detectVisibleAreas(eyePosition, viewDistance, grid) {
    for (let i = Math.max(eyePosition.y-viewDistance, 0); i <= Math.min(eyePosition.y+viewDistance, grid.height - 1); ++i) {
        for (let j = Math.max(eyePosition.x-viewDistance, 0); j <= Math.min(eyePosition.x+viewDistance, grid.width - 1); ++j) {
            let cell = grid.get(j, i);
            yield* cell.keys();
        }
    }
}
