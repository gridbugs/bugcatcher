import {detectVisibleArea} from './recursive_shadowcast.js';

export {detectVisibleArea};
export function* blindObserver(eyePosition, viewDistance, grid) {}
export function* omniscientObserver(eyePosition, viewDistance, grid) {
    yield* grid;
}
