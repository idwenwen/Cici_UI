import { toArray, isArray } from "lodash";
import { UUID } from "../common/manager";
import { each, remove } from "./array";
import { defNoEnum } from "./object";
const treeId = new UUID();
class Tree {
    constructor(parent, children) {
        defNoEnum(this, {
            _parent: parent || null,
            _children: children ? toArray(children) : [],
            _uuid: treeId.get(),
            level: parent.level ? parent.level + 1 : 1,
        });
    }
    setLevel() {
        this.level = this._parent ? this._parent.level + 1 : 1;
        if (this._children.length > 0) {
            each(this._children)((tree) => {
                tree.setLevel();
            });
        }
    }
    set parent(newParent) {
        this._parent && this._parent.remove(this);
        newParent._children.push(this);
        this._parent = newParent;
        this.setLevel();
    }
    get parent() {
        return this._parent;
    }
    set child(newChild) {
        newChild.parent = this;
    }
    get child() {
        return this._children[this._children.length - 1];
    }
    get first() {
        return this._children[0];
    }
    set children(newChildren) {
        if (isArray(newChildren)) {
            each(newChildren)((val) => {
                val.child = this;
            });
        }
        else {
            this.child = newChildren;
        }
    }
    get children() {
        return this._children;
    }
    remove(child) {
        return remove(this._children, (val) => val._uuid === child._uuid);
    }
    root(level = 1) {
        let rot = this;
        while (this.parent && this.parent.level >= level) {
            rot = this.parent;
        }
        return rot;
    }
    upper(upperLevel) {
        let finalLevel;
        if (upperLevel <= 0) {
            return false;
        }
        else {
            finalLevel = this.level - upperLevel;
            if (finalLevel <= 2) {
                finalLevel = 2;
            }
        }
        const parent = this.root(finalLevel - 1);
        this.parent = parent;
    }
    find(down) {
        if (down === 0) {
            return [this];
        }
        const finalLevel = this.level + down;
        if (finalLevel < this.level) {
            return [this.root(finalLevel)];
        }
        const list = [];
        for (const val of this.children) {
            list.push(...val.find(down - 1));
        }
        return list;
    }
    findByLevel(level) {
        if (level <= 0)
            return [];
        const rot = this.root();
        return rot.find(level - 1);
    }
    leaf() {
        if (this.children.length === 0) {
            return [this];
        }
        const leafs = [];
        each(this.children)((val) => {
            leafs.push(...val.leaf());
        });
        return leafs;
    }
    brother() {
        const levelNodes = this.findByLevel(this.level);
        return remove(levelNodes, (nodes) => {
            return nodes._uuid === this._uuid;
        });
    }
    *deepIterator(reverse = false) {
        if (!reverse) {
            yield this;
        }
        if (this._children.length > 0) {
            for (const val of this._children) {
                yield* val.deepIterator();
            }
        }
        if (reverse) {
            yield this;
        }
    }
    findNode(list, upper = false) {
        const nodes = [];
        if (!upper) {
            each(list)((val) => {
                nodes.push(...val.children);
            });
        }
        else {
            each(list)((val) => {
                const pa = val.parent;
                if (!nodes.find((item) => pa._uuid === item.uuid)) {
                    nodes.push(pa);
                }
            });
        }
        return nodes;
    }
    *horizenIterator(reverse = false) {
        let root = [this];
        let next = this.findNode;
        if (reverse) {
            root = this.leaf();
            next = (list) => {
                return this.findNode(list, true);
            };
        }
        while (root.length > 0 ||
            (reverse && root.length === 1 && root[1]._uuid === this._uuid)) {
            for (const val of root) {
                yield val;
            }
            root = next(root);
        }
    }
    *iteration(deep = true, reverse = false) {
        if (deep) {
            yield* this.deepIterator(reverse);
        }
        else {
            yield* this.horizenIterator(reverse);
        }
    }
    notify(operation, fromRoot = true, deep = true, reserve = false) {
        const root = fromRoot ? this.root() : this;
        const iter = root.iteration(deep, reserve);
        for (const val of iter) {
            operation(val);
        }
    }
}
export default Tree;
//# sourceMappingURL=tree.js.map