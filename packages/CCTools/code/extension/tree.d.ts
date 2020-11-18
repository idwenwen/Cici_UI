declare type notifyOperation = (tree: Tree) => any;
declare class Tree {
    _parent: Tree;
    _children: Tree[];
    _uuid: string;
    level: number;
    constructor(parent?: Tree, children?: Tree | Tree[]);
    private setLevel;
    set parent(newParent: Tree);
    get parent(): Tree;
    set child(newChild: Tree);
    get child(): Tree;
    get first(): Tree;
    set children(newChildren: Tree | Tree[]);
    get children(): Tree | Tree[];
    root(level?: number): Tree;
    upper(upperLevel: number): boolean;
    find(down: number): Tree[];
    findByLevel(level: number): Tree[];
    leaf(): Tree[];
    brother(): Tree[];
    private deepIterator;
    private findNode;
    private horizenIterator;
    iteration(deep?: boolean, reverse?: boolean): Generator<any, void, any>;
    notify(operation: notifyOperation, fromRoot?: boolean, deep?: boolean, reserve?: boolean): void;
}
export default Tree;
