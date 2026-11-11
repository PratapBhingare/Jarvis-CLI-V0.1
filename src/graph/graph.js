import rl from "../utils/readline.js";
import { START, END, StateGraph } from "@langchain/langgraph";
import * as z from "zod";
import { LLMNode } from "./node.js";
import { HumanMessage } from "langchain";

const stateFormat = z.object({
  messages: z.array(z.any()),
});

const graph = new StateGraph(stateFormat)
  .addNode("LLMNode", LLMNode)
  .addEdge(START, "LLMNode")
  .addEdge("LLMNode", END)
  .compile();

export default async function initGraph() {
  while (true) {
    const userInput = await rl.question("User : ");

    const response = await graph.invoke({
      messages: [new HumanMessage(userInput)],
    });
    console.log("AI : ", response);
  }
}
