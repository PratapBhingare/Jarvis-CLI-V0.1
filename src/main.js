import { getApikey, getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import rl from "./utils/readline.js";

async function main() {
  const settings = await getSettingsFile();

  if (!settings.apiKey) {
    const apiKey = await rl.question("Enter your API key here : ");
    await saveApiKey(apiKey);
  }

  const apiKey = await getApikey()

  console.log(apiKey);

  rl.close();
}

export default main;
