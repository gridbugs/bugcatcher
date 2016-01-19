export class Action {
    constructor() {
        this.success = true;
    }

    get type() {
        return this.constructor.type;
    }

    get direct() {
        return true;
    }

    fail() {
        this.success = false;
    }

    shouldReschedule() {
        return true;
    }

    commit() {}
}

export class IndirectAction extends Action {
    get direct() {
        return false;
    }
}


