import { ChatGroq } from "@langchain/groq";
import { getApikey } from "../../utils/file.utils.js";
import { AIMessage } from "langchain";
import { upsertFilesTool } from "../tools/files.tools.js";
import * as fileTools from "../tools/files.tools.js"; 

export async function LLMNode(state) {
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: (await getApikey()).apiKey,
  });

  const modelWithTools = model.bindTools([upsertFilesTool]);

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

  const toolResult = await Promise.all(toolCalls.map(async toolcall =>{
      return await fileTools[toolcall.name].invoke(toolcall)
  }))

  return {
    messages:[...state.messages, ...toolResult]
  }
}
