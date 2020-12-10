import { is } from "@cc/diagram/utils";
import { each } from "@cc/tools";
import { portType } from ".";
import PortHint from "./portHint";

function match(str: string[], has: string) {
  return str.join("|").search(has) >= 0;
}

const hasNoData = [];

/*********************** dataInput controller **********************/
const hasMoreDataInput = [
  "secureboost",
  "linr",
  "lr",
  "poisson",
  "heteronn",
  "homonn",
  "localbaseline",
  "fm",
  "mf",
  "svd",
  "scdpp",
  "gmf",
  "ftl",
  "psi",
  "kmeans",
];

const hasMultipleDataInput = ["evaluation", "union"];

function getDataInput(type: string, allSignlePort: boolean = false) {
  let res = [];
  if (match(hasNoData, type)) return res;
  const multiple = match(hasMultipleDataInput, type);
  if (allSignlePort || !match(hasMoreDataInput, type)) {
    res.push({
      name: "data0input",
      tip: "Data Input",
      type: portType.Data,
      multiple,
    });
  } else {
    res.push(
      ...[
        {
          name: "train_datainput",
          tooltip: "Train Data Input",
          type: portType.Data,
          multiple,
        },
        {
          name: "validate_datainput",
          tooltip: "Validation Data Input",
          type: portType.Data,
          multiple: false,
        },
      ]
    );
  }
}

/***********************dataoutput *************************/
const hasNoDataOutput = [
  "evaluation",
  "upload",
  "download",
  "pearson",
  "datasplit",
  "statistics",
  "psi",
  "kmeans",
];

const hasTwoOutputPort = ["kmeans"];

const hasThreeOutputPort = ["datasplit"];

function getDataOutput(type: string, _allSignlePort: boolean = false) {
  let res = [];
  if (match(hasNoData, type)) return res;
  if (!match(hasThreeOutputPort, type)) {
    res.push(
      ...[
        {
          name: "data0output",
          tip: "Train Data Output",
          type: portType.Data,
          multiple: false,
        },
        {
          name: "data1output",
          tip: "Validation Data Output",
          type: portType.Data,
          multiple: false,
        },
        {
          name: "data2output",
          tip: "Test Data Output",
          type: portType.Data,
          multiple: false,
        },
      ]
    );
  } else if (!match(hasTwoOutputPort, type)) {
    res.push(
      ...[
        {
          name: "data0output",
          tip: "Data Output_0",
          type: portType.Data,
          multiple: false,
        },
        {
          name: "data1output",
          tip: "Data Output_1",
          type: portType.Data,
          multiple: false,
        },
      ]
    );
  } else {
    res.push({
      name: "data0output",
      tip: "Data Output",
      type: portType.Data,
      multiple: false,
    });
  }
  return res;
}

/**************************modelInput*****************************/
const hasNoModel = [
  "intersection",
  "federatedsample",
  "evaluation",
  "upload",
  "download",
  "rsa",
  "datasplit",
  "reader",
  "union",
  "pearson",
  "scorecard",
];

const hasNoModelInput = ["statistics", "psi"];

function getModelInput(type: string, _allSignlePort: boolean = false) {
  let res = [];
  if (match(hasNoModel, type)) return res;
  else if (match(hasNoModelInput, type)) return res;
  else {
    res.push({
      name: "modelinput",
      tip: "Model Input",
      type: portType.Model,
    });
  }
  return res;
}

/****************************modelOutput**************************/

const hasMultipeModelOutput = ["selection"];
const hasNoModelOutput = [];

function getModelOutput(type: string, _allSignlePort: boolean = false) {
  let res = [];
  const multiple = match(hasMultipeModelOutput, type);
  if (match(hasNoModel, type)) return res;
  else if (match(hasNoModelOutput, type)) return res;
  else {
    res.push({
      name: "modeloutput",
      tip: "Model Output",
      type: "model",
      multiple,
    });
  }
  return res;
}

/*****************************finalConfig checked***************************/
export function portConfig(type: string, allSinglePort: boolean = false) {
  type = type.toLowerCase();
  let dataIn = getDataInput(type, allSinglePort);
  let dataOut = getDataOutput(type, allSinglePort);
  let modelIn = getModelInput(type, allSinglePort);
  let modelOut = getModelOutput(type, allSinglePort);
  return {
    input: [...dataIn, ...modelIn],
    output: [...dataOut, ...modelOut],
  };
}
