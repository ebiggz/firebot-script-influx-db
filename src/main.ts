import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { InfluxDbConfig, setInfluxConfig } from "./config";
import { initLogger } from "./logger";
import { initFrontendEventListeners } from "./events";
import { writeDataToInfluxDbEffectType } from "./effects/write-data";

const script: Firebot.CustomScript<InfluxDbConfig> = {
  getScriptManifest: () => {
    return {
      name: "InfluxDB",
      description:
        'Write data to InfluxDB via the "Write Data (InfluxDB)" Effect',
      author: "ebiggz",
      version: "1.0",
      firebotVersion: "5",
      startupOnly: true,
    };
  },
  getDefaultParameters: () => {
    return {
      url: {
        type: "string",
        title: "URL",
        description: "URL of the InfluxDB instance",
        default: "http://localhost:8086",
      },
      apiToken: {
        type: "password",
        title: "API Token",
        description: "An API token with write access to the InfluxDB instance",
        placeholder: "Enter token",
        default: "",
      },
      orgNames: {
        type: "editable-list",
        title: "Organizations",
        settings: {
          addLabel: "Add Organization",
          editLabel: "Edit Organization",
          noneAddedText: "No organizations added",
          sortable: false,
          useTextArea: false,
        },
        default: ["my-org"],
      },
      bucketNames: {
        type: "editable-list",
        title: "Bucket Names",
        settings: {
          addLabel: "Add Bucket",
          editLabel: "Edit Edit",
          sortable: false,
          noneAddedText: "No buckets added",
          useTextArea: false,
        },
        default: ["my-bucket"],
      },
      precision: {
        type: "enum",
        title: "Precision",
        options: ["ns", "us", "ms", "s"],
        default: "ns",
      },
    };
  },
  run: async (runRequest) => {
    const { logger } = runRequest.modules;

    initLogger(logger);

    setInfluxConfig(runRequest.parameters);

    initFrontendEventListeners(runRequest.modules.frontendCommunicator);

    runRequest.modules.effectManager.registerEffect(
      writeDataToInfluxDbEffectType
    );
  },
  parametersUpdated: (parameters) => {
    setInfluxConfig(parameters);
  },
};

export default script;
