import { toArray, isArray } from "lodash";
import { UUID } from "../common/manager";
import { each, remove } from "./array";
import { defNoEnum } from "./object";

type notifyOperation = (tree: Tree) => any;

const treeId = new UUID();

/**
 * Tree structure, preset default Tree class, for rapid development
 * 1. Hierarchy
 * 2. Node search
 * 3. Flexible structure
 * 4. iteration
 */
class Tree {
  _parent: Tree;
  _children: Tree[];
  _uuid: string;
  level: number; // Tree node level
  constructor(parent?: Tree, children?: Tree | Tree[]) {
    defNoEnum(this, {
      _parent: parent || null,
      _children: children ? toArray(children) : [],
      _uuid: treeId.get(),
      level: parent.level ? parent.level + 1 : 1,
    });
  }

  private setLevel() {
    this.level = this._parent ? this._parent.level + 1 : 1;
    if (this._children.length > 0) {
      each(this._children)((tree) => {
        tree.setLevel();
      });
    }
  }

  // parent-property help to set parent-node and update level
  set parent(newParent: Tree) {
    this._parent && this._parent.remove(this);
    newParent._children.push(this);
    this._parent = newParent;
    this.setLevel();
  }
  get parent() {
    return this._parent;
  }

  // Child-property help to set new child-node and get newest child-node
  set child(newChild: Tree) {
    newChild.parent = this;
  }
  get child() {
    return this._children[this._children.length - 1];
  }
  get first() {
    return this._children[0];
  }

  // Children-propert helps to set bunch of child-node and get all child-node
  set children(newChildren: Tree | Tree[]) {
    if (isArray(newChildren)) {
      each(<Array<Tree>>newChildren)((val) => {
        val.child = this;
      });
    } else {
      this.child = <Tree>newChildren;
    }
  }
  get children() {
    return this._children;
  }

  remove(child: Tree) {
    return remove(this._children, (val) => val._uuid === child._uuid);
  }

  /**
   * Get root-node
   */
  root(level: number = 1): Tree {
    let rot: Tree = this;
    while (this.parent && this.parent.level >= level) {
      rot = this.parent;
    }
    return rot;
  }

  upper(upperLevel: number): boolean {
    let finalLevel;
    if (upperLevel <= 0) {
      // slide down or keep
      return false;
    } else {
      finalLevel = this.level - upperLevel;
      if (finalLevel <= 2) {
        finalLevel = 2;
      }
    }
    const parent = this.root(finalLevel - 1);
    this.parent = parent;
  }

  // Find node at 'down' level according to self
  find(down: number): Tree[] {
    if (down === 0) {
      return [this];
    }
    const finalLevel = this.level + down;
    if (finalLevel < this.level) {
      return [this.root(finalLevel)];
    }
    const list = [];
    for (const val of <Array<Tree>>this.children) {
      list.push(...val.find(down - 1));
    }
    return list;
  }

  /**
   * Get tree Nodes by concrete level
   * @param level
   */
  findByLevel(level: number): Tree[] {
    if (level <= 0) return [];
    const rot = this.root();
    return rot.find(level - 1);
  }

  /**
   * Get all leaf nodes
   */
  leaf(): Tree[] {
    if ((<Array<Tree>>this.children).length === 0) {
      return [this];
    }
    const leafs = [];
    each(<Array<any>>this.children)((val) => {
      leafs.push(...val.leaf());
    });
    return leafs;
  }

  // Find brother-node
  brother(): Tree[] {
    const levelNodes = this.findByLevel(this.level);
    return remove(levelNodes, (nodes) => {
      return nodes._uuid === this._uuid;
    });
  }

  private *deepIterator(reverse: boolean = false) {
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

  private findNode(list: Array<Tree>, upper: boolean = false) {
    const nodes = [];
    if (!upper) {
      // Get next level of Tree
      each(list)((val) => {
        nodes.push(...val.children);
      });
    } else {
      each(list)((val) => {
        const pa = val.parent;
        if (!nodes.find((item) => pa._uuid === item.uuid)) {
          nodes.push(pa);
        }
      });
    }
    return nodes;
  }

  private *horizenIterator(reverse: boolean = false) {
    let root: Tree[] = [this];
    let next: Function = this.findNode;
    if (reverse) {
      root = this.leaf();
      next = (list: Array<Tree>) => {
        return this.findNode(list, true);
      };
    }
    while (
      root.length > 0 ||
      (reverse && root.length === 1 && root[1]._uuid === this._uuid)
    ) {
      for (const val of root) {
        yield val;
      }
      root = next(root);
    }
  }

  *iteration(deep: boolean = true, reverse: boolean = false) {
    if (deep) {
      yield* this.deepIterator(reverse);
    } else {
      yield* this.horizenIterator(reverse);
    }
  }

  /**
   * Notify all node in Tree
   * @param operation
   * @param fromRoot Do from root node
   * @param deep Using deep iteration
   * @param reserve Sort of iteration
   */
  notify(
    operation: notifyOperation,
    fromRoot: boolean = true,
    deep: boolean = true,
    reserve: boolean = false
  ) {
    const root = fromRoot ? this.root() : this;
    const iter = root.iteration(deep, reserve);
    for (const val of iter) {
      operation(val);
    }
  }
}

export default Tree;
