declare type DOMAttrs = {
    [name: string]: string;
};
declare class DomExtension {
    create(name: string): HTMLElement;
    append(parent: HTMLElement, children: HTMLElement): void;
    setAttr(dom: HTMLElement, name: string, value: string): any;
    setAttr(dom: HTMLElement, name: DOMAttrs, value?: never): any;
    removeAttr(dom: HTMLElement, name: string[] | string): void;
    getStyle(dom: HTMLElement): {};
    setStyle(dom: HTMLElement, key: string, value: string): any;
    setStyle(dom: HTMLElement, key: DOMAttrs, value?: never): any;
    removeStyle(dom: HTMLElement, key: string | string[]): void;
    getClass(dom: HTMLElement): Array<string>;
    setClass(dom: HTMLElement, cla: string | string[]): void;
    removeClass(dom: HTMLElement, cla: string | string[]): void;
}
declare const operation: DomExtension;
export default operation;
