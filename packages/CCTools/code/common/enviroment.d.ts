declare class Enviroment {
    isNode: boolean;
    isBrowser: boolean;
    isOther: boolean;
    version: string;
    supplier: string;
    isSupport: boolean;
    constructor();
    private nodeDetail;
    private browserDetail;
}
declare const enviroment: Enviroment;
export default enviroment;
