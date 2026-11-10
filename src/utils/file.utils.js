import fs from "fs/promises";
import { CONFIG_DIR } from "./constants.js";
import path from "path";

export const getSettingsFile = async () => {
  try {
    await fs.access(CONFIG_DIR);
  } catch (error) {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }

  const settingsFilePath = path.join(CONFIG_DIR, "settings.json");

  try {
    await fs.access(settingsFilePath);
    const content = await fs.readFile(settingsFilePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    await fs.writeFile(settingsFilePath, JSON.stringify({}));
    return {};
  }
};

export const saveApiKey = async (apiKey) => {
  const settingsFilePath = path.join(CONFIG_DIR, "settings.json");

  const settingsConntent = await getSettingsFile();

  await fs.writeFile(
    settingsFilePath,
    JSON.stringify({ ...settingsConntent, apiKey })
  );
};

export const getApikey = async () => { 
    const settings = await getSettingsFile();
    return settings.apiKey || null;
};
