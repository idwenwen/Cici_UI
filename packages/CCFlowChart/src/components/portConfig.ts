import { each } from "@cc/tools";
import { portType } from "./port";

function dataInput(singlePort: boolean, multiple: boolean = false) {
  return singlePort
    ? [
        {
          type: portType.Data,
          name: "datainput",
          tip: "Data Input",
          multiple: multiple,
        },
      ]
    : [
        {
          type: portType.Data,
          name: "train_datainput",
          tip: "Train Data Input",
          multiple: false,
        },
        {
          type: portType.Data,
          name: "validate_datainput",
          tip: "Validation Data Input",
          multiple: false,
        },
      ];
}

function dataOutput(_singlePort: boolean, multiple: boolean = false) {
  return [
    {
      type: portType.Data,
      name: "data0output",
      tip: "Data Output",
      multiple,
    },
  ];
}

function modelInput(_singlePort: boolean, multiple: boolean = false) {
  return [
    {
      type: portType.Model,
      name: "modelinput",
      tip: "Model Input",
      multiple,
    },
  ];
}

function modelOutput(_singlePort: boolean, multiple: boolean = false) {
  return [
    {
      type: portType.Model,
      name: "modeloutput",
      tip: "Model Ouput",
    },
  ];
}

export function portConfig(
  type: string,
  singlePort: boolean = false,
  multiple: boolean = false
) {
  type = type.toLowerCase();
  let dataIn = dataInput(singlePort);
  let dataOut = dataOutput(singlePort);
  let modelIn = modelInput(singlePort);
  let modelOut = modelOutput(singlePort);
  if (type.search(/(reader)/i) >= 0) {
    dataIn = [];
  }
  if (
    type.search(
      /(evaluation|upload|download|pearson|datasplit|statistics|psi|kmeans)/i
    ) >= 0
  ) {
    dataOut = [];
  }
  if (type.search(/(kmeans)/i) >= 0) {
    dataOut = each([1, 2])((val) => {
      return {
        type: portType.Model,
        name: `data${val}output`,
        tip: `Data Output_${val}`,
        multiple,
      };
    });
  }
  if (type.search(/(datasplit)/i) >= 0) {
    dataOut = each([
      "Train Data Output",
      "Validation Data Output",
      "Test Data Output",
    ])((val, index) => {
      return {
        type: portType.Model,
        name: `data${index}output`,
        tip: val,
        multiple,
      };
    });
  }
  if (
    type.search(
      /(intersection|federatedsample|evaluation|upload|download|rsa|datasplit|reader|union|pearson|scorecard)/i
    ) >= 0
  ) {
    modelIn = [];
    modelOut = [];
  }
  if (type.search(/(statistics|psi)/i) >= 0) {
    modelIn = [];
  }
  return {
    input: [...dataIn, ...modelIn],
    output: [...dataOut, ...modelOut],
  };
}
