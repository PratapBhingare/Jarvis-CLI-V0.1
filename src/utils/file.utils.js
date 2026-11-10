import fs from "fs/promises";
import { CONFIG_DIR } from "./constants.js";
import path from "path";
import axios from "axios";

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
  const apiKey = settings.apiKey || null;

  if (!apiKey) {
    return {
      error: "Api key not found",
    };
  }

  try {
    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return {
      apiKey,
    };
  } catch (error) {
    return {
      error: "Invalid or expired API key",
    };
  }
};
