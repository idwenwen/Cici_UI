export type diagramDrawing = (
  container: any,
  parameter: diagramParameter,
  ...meta: any[]
) => any;

export type diagramParameter = {
  [parameter: string]: any;
};

export type diagram = {
  parameter: diagramParameter;
  drawing: diagramDrawing;
};

export type numberSetting = {
  is: string; // number
  max?: number;
  min?: number;
  boundary?: boolean;
};

export type stringSetting = {
  is: string; // string
  match?: string;
  length?: number;
};

export type arraySetting = {
  is: string; // array
  condition?: Array<any> | object;
  length?: number;
};

export type objectSetting = {
  is: string; // object
  require: {
    [key: string]: numberSetting | stringSetting | arraySetting | objectSetting;
  };
};

export type setting =
  | stringSetting
  | numberSetting
  | objectSetting
  | arraySetting;
