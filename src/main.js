import initGraph from "./ai/graph/graph.js";
import { getApikey, getSettingsFile, saveApiKey } from "./utils/file.utils.js";
import rl from "./utils/readline.js";

async function main() {
  const settings = await getSettingsFile();

  if (!settings.apiKey) {
    const apiKey = await rl.question("Enter your API key here : ");
    await saveApiKey(apiKey);
  }

  const response = await getApikey()

  if(response.error){
    console.log("Invalid or expired API Key");
    const apiKey = await rl.question("Enter your API key here : ");
    await saveApiKey(apiKey);
    return main();
  }

  const apiKey = response.apiKey;

  await initGraph();

  rl.close();
}

export default main;
