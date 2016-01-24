import {Heap} from './heap.js';
import {InventoryFull, InventorySlotEmpty, NoSuchInventorySlot} from './exception.js';

export class NumericInventory {
    constructor(numSlots) {
        this.numSlots = numSlots;
        this.slotAllocator = new Heap((a, b) => {return b - a;});
        for (let i = 1; i <= this.numSlots; ++i) {
            this.slotAllocator.insert(i);
        }
        this.array = new Array(numSlots);
    }

    insert(entity) {
        try {
            var slotIndex = this.slotAllocator.pop();
            this.array[slotIndex] = entity;
        } catch (e) {
            throw new InventoryFull();
        }
    }

    get(index) {
        return this.array[index];
    }

    *[Symbol.iterator]() {
        for (let i = 1; i <= this.numSlots; ++i) {
            yield [i, this.array[i]];
        }
    }

    *contents() {
        for (let e of this.array) {
            if (e != undefined) {
                yield e;
            }
        }
    }

    delete(index) {
        if (this.array[index] == null) {
            throw new InventorySlotEmpty();
        }
        if (index < 1 || index > this.numSlots) {
            throw new NoSuchInventorySlot();
        }
        var entity = this.array[index];
        this.array[index] = null;
        this.slotAllocator.insert(index);
        return entity;
    }
}
