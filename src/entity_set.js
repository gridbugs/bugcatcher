export class EntitySet {
    constructor(iterable) {
        this._set = new Set(iterable);
    }

    *[Symbol.iterator]() {
        yield* this._set;
    }

    clear() {
        this._set.clear();
    }

    delete(entity) {
        this._set.delete(entity);
    }

    add(entity) {
        this._set.add(entity);
    }

    entries() {
        return this._set.entries();
    }
}

export class ComponentCountingEntitySet extends EntitySet {
    constructor(iterable) {
        super(iterable);
        this.componentCount = [];
    }

    onRemoveComponent(entity, component) {
        --this.componentCount[component.type];
    }

    onAddComponent(entity, component) {
        let idx = component.type;
        if (this.componentCount[idx] == undefined) {
            this.componentCount[idx] = 0;
        }
        ++this.componentCount[idx];
    }

    hasComponent(component) {
        return this.componentCount[component.type] > 0;
    }

    count(entity) {
        for (let c of entity.iterateComponents()) {
            let idx = c.type;
            if (this.componentCount[idx] == undefined) {
                this.componentCount[idx] = 0;
            }
            ++this.componentCount[idx];
        }
    }

    add(entity) {
        if (this._set.has(entity)) {
            return;
        }
        this.count(entity);
        super.add(entity);
    }

    delete(entity) {
        if (!this._set.has(entity)) {
            return;
        }
        for (let c of entity.iterateComponents()) {
            --this.componentCount[c];
        }
        super.delete(entity);
    }

    clear() {
        this.componentCount = [];
        super.clear();
    }
}
