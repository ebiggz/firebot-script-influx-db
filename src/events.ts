import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { getInfluxConfig } from "./config";

export const initFrontendEventListeners = (
  frontendCommunicator: ScriptModules["frontendCommunicator"]
) => {
  frontendCommunicator.onAsync("ebiggz:influxdb:get-orgs", async () => {
    const influxConfig = getInfluxConfig();
    return influxConfig.orgNames;
  });
  frontendCommunicator.onAsync("ebiggz:influxdb:get-buckets", async () => {
    const influxConfig = getInfluxConfig();
    return influxConfig.bucketNames;
  });
};
