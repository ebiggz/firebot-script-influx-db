import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { InfluxDB, Point, HttpError } from "@influxdata/influxdb-client";
import { getInfluxConfig } from "../config";
import { logger } from "../logger";

type Options = {
  orgName: string;
  bucketName: string;
  mode: "raw-records" | "point";
  rawRecords?: string;
};

export const writeDataToInfluxDbEffectType: Firebot.EffectType<Options> = {
  definition: {
    id: "ebiggz:write-data-influxdb",
    name: "Write Data (InfluxDB)",
    description: "Write data to an InfluxDB instance",
    icon: "fad fa-database",
    categories: ["advanced"],
  },
  optionsTemplate: `
    <eos-container header="Organization">
      <firebot-searchable-select
        items="orgOptions"
        ng-model="effect.orgName"
        placeholder="Select organization"
      ></firebot-searchable-select>
    </eos-container>

    <eos-container header="Bucket" pad-top="true">
      <firebot-searchable-select
        items="bucketOptions"
        ng-model="effect.bucketName"
        placeholder="Select bucket"
      ></firebot-searchable-select>
    </eos-container>

    <eos-container header="Records" pad-top="true">
        <firebot-input 
            model="effect.rawRecords" 
            use-text-area="true"
            placeholder-text="Enter records"
            rows="4"
            cols="40"
        />

        <div class="effect-info alert alert-info mt-7">
            Records must be formatted in the <a href="https://docs.influxdata.com/influxdb/v2/reference/syntax/line-protocol/">Line Protocol</a> format.
        </div>
    </eos-container>
  `,
  optionsController: ($scope, backendCommunicator: any) => {
    $scope.orgOptions = [];
    $scope.bucketOptions = [];

    backendCommunicator
      .fireEventAsync("ebiggz:influxdb:get-orgs")
      .then((orgNames: string[]) => {
        $scope.orgOptions =
          orgNames?.map((o) => ({
            id: o,
            name: o,
          })) ?? [];
      });

    backendCommunicator
      .fireEventAsync("ebiggz:influxdb:get-buckets")
      .then((bucketNames: string[]) => {
        $scope.bucketOptions =
          bucketNames?.map((b) => ({
            id: b,
            name: b,
          })) ?? [];
      });

    if (!$scope.effect.mode) {
      $scope.effect.mode = "raw-records";
    }
  },
  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.orgName) {
      errors.push("Organization name is required");
    }

    if (!effect.bucketName) {
      errors.push("Bucket name is required");
    }

    if (effect.mode === "raw-records") {
      if (!effect.rawRecords) {
        errors.push("Please input records in the Line Protocol format");
      }
    }

    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    const influxConfig = getInfluxConfig();

    const writeApi = new InfluxDB({
      url: influxConfig.url,
      token: influxConfig.apiToken,
      writeOptions: {
        writeFailed(error, lines, attempt, expires) {
          logger.error(
            `InfluxDB: Write failed`,
            error,
            lines,
            attempt,
            expires
          );
        },
        writeSuccess(lines) {
          logger.debug(`InfluxDB: Wrote records successfully`, lines);
        },
      },
    }).getWriteApi(effect.orgName, effect.bucketName, influxConfig.precision);

    if (effect.mode === "raw-records") {
      logger.debug("InfluxDB: Writing records");
      writeApi.writeRecords(effect.rawRecords.split("\n"));
    } else {
      logger.error("InfluxDB: Unsupported write mode");
    }

    try {
      await writeApi.close();
    } catch (e) {
      logger.error("InfluxDB error", e);
    }
  },
};
