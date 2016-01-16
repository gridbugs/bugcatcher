export class LeafNode {
    constructor(tree) {
        this.tree = tree;
    }
    insert(key, value) {
        return this.tree.makeBranch(key, value);
    }
    delete(key) {
        throw new Error(`No value for key: ${key}`);
    }
    get(key) {
        throw new Error(`No value for key: ${key}`);
    }
    isLeaf() {
        return true;
    }
    rebalance() {}
    *prefixKeys() {}
    *prefixValues() {}
    *prefixPairs() {}
    *prefixNodes(leaves) {
        if (leaves) {
            yield this;
        }
    }
}

export class BranchNode {
    constructor(tree, key, value) {
        this.tree = tree;
        this.key = key;
        this.value = value;
        this.left = this.getLeaf();
        this.right = this.getLeaf();
    }

    compare(a, b) {
        return this.tree.compare(a, b);
    }

    isLeaf() {
        return false;
    }

    getLeaf() {
        return this.tree.leaf;
    }

    become(node) {
        this.key = node.key;
        this.value = node.value;
    }

    insert(key, value) {
        if (this.compare(key, this.key) < 0) {
            this.left = this.left.insert(key, value);
        } else {
            this.right = this.right.insert(key, value);
        }

        return this;
    }

    get(key) {
        var cmp = this.compare(key, this.key);
        if (cmp < 0) {
            return this.left.get(key);
        } else if (cmp > 0) {
            return this.right.get(key);
        } else {
            return this.value;
        }
    }

    delete(key) {
        var cmp = this.compare(key, this.key);
        if (cmp < 0) {
            this.left = this.left.delete(key);
        } else if (cmp > 0) {
            this.right = this.right.delete(key);
        } else if (cmp == 0) {
            this.tree.lastDeletedValue = this.value;
            if (this.right.isLeaf()) {
                return this.left;
            } else if (this.left.isLeaf()) {
                return this.right;
            } else {
                this.left = this.left.deleteMaxNode();
                this.become(this.tree.lastDeletedNode);
            }
        } else {
            throw new Error(`Comparitor must return number. Returned: ${cmp}`);
        }

        return this;
    }

    getMaxNode() {
        if (this.right.isLeaf()) {
            return this;
        } else {
            return this.right.getMaxNode();
        }
    }

    deleteMaxNode() {
        if (this.right.isLeaf()) {
            this.tree.lastDeletedNode = this;
            return this.left;
        } else {
            this.right = this.right.deleteMaxNode();
            return this;
        }
    }

    *prefixValues() {
        yield* this.left.prefixValues();
        yield this.value;
        yield* this.right.prefixValues();
    }
    
    *prefixKeys() {
        yield* this.left.prefixKeys();
        yield this.key;
        yield* this.right.prefixKeys();
    }

    *prefixPairs() {
        yield* this.left.prefixPairs();
        yield [this.key, this.value];
        yield* this.right.prefixPairs();
    }
    
    *prefixNodes(leaves) {
        yield* this.left.prefixNodes(leaves);
        yield this;
        yield* this.right.prefixNodes(leaves);
    }
}

export class BinaryTree {
    constructor(compare) {
        this.leaf = this.makeLeaf();
        this.root = this.leaf;
        this.lastDeletedNode = this.leaf;
        this.lastDeletedValue = null;
        this.compare = compare;
    }

    makeBranch(key, value) {
        return new BranchNode(this, key, value);
    }

    makeLeaf() {
        return new LeafNode(this);
    }

    set(key, value) {
        this.root = this.root.insert(key, value);
    }
    get(key) {
        return this.root.get(key);
    }

    delete(key) {
        this.root = this.root.delete(key);
        return this.lastDeletedValue;
    }

    *prefixValues() {
        yield* this.root.prefixValues();
    }
    *prefixKeys() {
        yield* this.root.prefixKeys();
    }
    *prefixPairs() {
        yield* this.root.prefixPairs();
    }
    *prefixNodes(leaves) {
        yield* this.root.prefixNodes(leaves);
    }
}
