import { tool } from "langchain";
import * as z from "zod";
import fs from "fs/promises";

export const upsertFilesTool = tool(
  async function ({ files }) {
    await Promise.all(
      files.map(async (file) => {
        return await fs.writeFile(file.path, file.content);
      })
    );
    return "File created successfully";
  },
  {
    name: "upsertFilesTool",
    description:
      "create/update multiple files at once (create one if not existed)",
    schema: z.object({
      files: z.array(
        z.object({
          path: z
            .string()
            .describe("absolute path of the file to be created/update"),
          content: z
            .string()
            .describe("content of the file to be created/update"),
        })
      ),
    }),
  }
);

export const listFiles = tool(
  async function ({ folder }) {
    const result = [];
    async function traverse(currentFolder) {
      const entries = await fs.readdir(currentFolder, { withFileTypes: true }); 
      for (const entry of entries) {
        const fullpath = `${currentFolder}/${entry.name}`;
        if (entry.isDirectory()) {
          if (entry.name == "node_modules") continue;
          await traverse(fullpath);
        } else {
          result.push(fullpath);
        }
      }
    }

    await traverse(folder);
    return JSON.stringify(result);
  },
  {
    name: "listFiles",
    description:
      "list all the folders (recursively) and files in the current folder (ignores folders like node_modules)",
    schema: z.object({
      folder: z.string().describe("absoulte path of the folder to ist"),
    }),
  }
);

export const readFiles = tool(
  async function ({ files }) {
    const results = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path, "utf-8");
        return { path: file.path, content };
      })
    );
    return JSON.stringify(results);
  },
  {
    name: "readFiles",
    description: "read multiple files at once",
    schema: z.object({
      files: z.array(
        z.object({
          path: z.string().describe("absolute path of the file to be read"),
        })
      ),
    }),
  }
);
