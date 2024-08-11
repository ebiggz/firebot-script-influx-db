export type InfluxDbConfig = {
  url: string;
  apiToken: string;
  orgNames: string[];
  bucketNames: string[];
  precision: "ns" | "us" | "ms" | "s";
};

/**
 * InfluxDB configuration with defaults
 */
let config: InfluxDbConfig = {
  url: "http://localhost:8086",
  apiToken: "",
  orgNames: ["my-org"],
  bucketNames: ["my-bucket"],
  precision: "ns",
};

/**
 * Set the InfluxDB configuration
 * @param newConfig New configuration
 */
export const setInfluxConfig = (newConfig: InfluxDbConfig): void => {
  config = newConfig;
};

/**
 * Get the InfluxDB configuration
 */
export const getInfluxConfig = (): InfluxDbConfig => {
  return config;
};
