class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

export class LinkedList {
    constructor(iterable) {
        this.head = null;
        this.length = 0;
        if (iterable != undefined) {
            for (let x of iterable) {
                this.push(x);
            }
        }
    }

    push(data) {
        var node = new Node(data);
        node.next = this.head;
        this.head = node;
        ++this.length;
    }

    peek() {
        return this.head.data;
    }

    pop() {
        var node = this.head;
        var data = node.data;
        this.head = node.next;
        --this.length;
        return data;
    }

    get empty() {
        return this.length == 0;
    }

    *[Symbol.iterator]() {
        var node = this.head;
        while (node != null) {
            yield node.data;
            node = node.next;
        }
    }
}
