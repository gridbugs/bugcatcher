import {LeafNode, BranchNode, BinaryTree} from './binary_tree.js';

export class AvlLeafNode extends LeafNode {
    constructor(tree) {
        super(tree);
    }

    getHeight() {
        return -1;
    }
}

export class AvlBranchNode extends BranchNode {
    constructor(tree, key, value) {
        super(tree, key, value);
        this.height = 0;
        this.balanceFactor = 0;
    }

    insert(key, value) {
        super.insert(key, value);
        this.update();
        return this.rebalance();
    }

    delete(key) {
        let ret = super.delete(key);
        this.update();
        return ret.rebalance();
    }

    getHeight() {
        return this.height;
    }

    update() {
        let leftHeight = this.left.getHeight();
        let rightHeight = this.right.getHeight();
        this.height = Math.max(leftHeight, rightHeight) + 1;
        this.balanceFactor = leftHeight - rightHeight;
    }

    rotateLeft() {
        let root = this.right;
        this.right = root.left;
        root.left = this;

        this.update();
        root.update();

        return root;
    }

    rotateRight() {
        let root = this.left;
        this.left = root.right;
        root.right = this;
        
        this.update();
        root.update();

        return root;
    }

    rebalance() {
        if (this.balanceFactor == 2) {
            if (this.left.balanceFactor == -1) {
                this.left = this.left.rotateLeft();
            }
            return this.rotateRight();
        } else if (this.balanceFactor == -2) {
            if (this.right.balanceFactor == 1) {
                this.right = this.right.rotateRight();
            }
            return this.rotateLeft();
        }
        return this;
    }
}

export class AvlTree extends BinaryTree {
    constructor(compare) {
        super(compare);
    }

    makeBranch(key, value) {
        return new AvlBranchNode(this, key, value);
    }

    makeLeaf() {
        return new AvlLeafNode(this);
    }
}
