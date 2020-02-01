import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Size, VirtualCapture } from "@qawolf/screen";
import { BrowserType, getBrowserType } from "@qawolf/types";
import playwright from "playwright";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { LaunchOptions as PlaywrightLaunchOptions } from "playwright-core/lib/server/browserType";
import { getDevice } from "./device";
import {
  CreateContextOptions,
  QAWolfBrowserContext
} from "./QAWolfBrowserContext";

export type LaunchOptions = PlaywrightLaunchOptions &
  Omit<CreateContextOptions, "device"> & {
    browser?: BrowserType;
    device?: DeviceDescriptor | string;
  };

export const buildLaunchOptions = (options: LaunchOptions) => {
  const browser = getBrowserType(options.browser || CONFIG.browser);

  const device = getDevice(options.device);

  const headless = options.headless || CONFIG.headless;

  const windowSize = {
    height: device.viewport.height,
    width: device.viewport.width
  };

  let args: string[] = [];
  if (browser === "chromium") {
    args = [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0"
    ];

    // browser frame with "controlled by automated"
    windowSize.height += 120;

    if (!headless) {
      args.push(`--window-size=${windowSize.width},${windowSize.height}`);
    }
  } else if (browser === "firefox") {
    // browser frame
    windowSize.height += 40;

    if (!headless) {
      args = [
        "-width",
        `${windowSize.width}`,
        "-height",
        `${windowSize.height}`
      ];
    }
  } else if (browser === "webkit") {
    // browser frame
    windowSize.height += 40;
  }

  const launchOptions = {
    args,
    ...options,
    browser,
    device,
    headless,
    windowSize
  };

  return launchOptions;
};

export const createCapture = (headless: boolean = false, size: Size) => {
  if (!CONFIG.artifactPath || CONFIG.disableVideoArtifact) return null;

  if (headless) {
    logger.info(
      "video capture disabled: cannot capture when the browser is headless"
    );
    return null;
  }

  return VirtualCapture.create({
    savePath: CONFIG.artifactPath,
    size
  });
};

export const launch = async (options: LaunchOptions = {}) => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const { windowSize, ...launchOptions } = buildLaunchOptions(options);

  const capture = await createCapture(launchOptions.headless, windowSize);

  if (capture) {
    launchOptions.env = {
      ...launchOptions.env,
      DISPLAY: capture.xvfb.screen
    };
  }

  logger.verbose(`launch: browser ${JSON.stringify(launchOptions)}`);
  try {
    const playwrightBrowser = await playwright[launchOptions.browser!].launch(
      launchOptions
    );

    return QAWolfBrowserContext.create(playwrightBrowser, {
      ...launchOptions,
      capture: capture || undefined
    });
  } catch (e) {
    logger.error(`launch: failed ${e.toString()}`);
    throw e;
  }
};
