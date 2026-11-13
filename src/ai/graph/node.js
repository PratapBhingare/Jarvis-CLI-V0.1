import { ChatGroq } from "@langchain/groq";
import { getApikey } from "../../utils/file.utils.js";
import rl from "../../utils/readline.js"; 
import { AIMessage } from "langchain";
import { upsertFilesTool, readFiles, listFiles } from "../tools/files.tools.js";
import * as fileTools from "../tools/files.tools.js";

export async function LLMNode(state) {
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: (await getApikey()).apiKey,
  });

  const modelWithTools = model.bindTools([
    upsertFilesTool,
    readFiles,
    listFiles,
  ]);

  const stream = await modelWithTools.stream(state.messages);

  process.stdout.write("AI : ");

  let aiMessage = null;
  for await (const chunk of stream) {
    process.stdout.write(chunk.text);
    if (!aiMessage) aiMessage = chunk;
    else aiMessage = aiMessage.concat(chunk);
  }

  process.stdout.write("\n");

  return {
    messages: [...state.messages, aiMessage],
  };
}

export async function ToolNode(state, config) {
  const message = state.messages;
  const lastMessage = message[message.length - 1];
  const toolCalls = lastMessage.tool_calls;

  const toolResults = [];

  for (const toolCall of toolCalls) {
    switch (toolCall.name) {
      case "upsertFilesTool":
        process.stdout.write(
          `[Tool]: Updating/creating files ${JSON.stringify(
            toolCall.args.files.map((f) => f.path).join(", ")
          )}\n`
        );
        const userInput = await rl.question(
          "Do you want to proceed? (yes/no): "
        );
        if (userInput.toLowerCase() !== "yes") {
          process.stdout.write("Aborting file update.\n");
          return new ToolMessage({
            content: "User aborted file update/create.",
            tool_call_id: toolCall.id,
          });
        }
        const result = await fileTools.upsertFilesTool.invoke(toolCall);
        toolResults.push(result);
        break;
      case "readFiles":
        process.stdout.write(
          `[Tool]: Reading files ${JSON.stringify(
            toolCall.args.files.map((f) => f.path).join(", ")
          )}\n`
        );
        const readResult = await fileTools.readFiles.invoke(toolCall);
        toolResults.push(readResult);
        break;

      case "listFiles":
        process.stdout.write(`[Tool]: Listing files\n`);
        const listResult = await fileTools.listFiles.invoke(toolCall);
        toolResults.push(listResult);
        break;

      default:
        process.stdout.write(`[Tool]: Unknown tool ${toolCall.name}\n`);
        break;
    }
  }

  return {
    messages: [...state.messages, ...toolResults],
  };
}
