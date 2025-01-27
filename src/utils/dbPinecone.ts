import { PineconeVectorStore } from "llamaindex/vector-store/PineconeVectorStore";
import {
  SimpleDirectoryReader,
  LlamaParseReader,
} from "llamaindex/readers/index";

const pvs = new PineconeVectorStore({
  indexName: "wordpress-client-a",
});

const model = "multilingual-e5-large";

const client = await pvs.client();

export const DATA_DIR = "./data";

export async function getDocuments() {
  const reader = new SimpleDirectoryReader();
  // Load PDFs using LlamaParseReader
  return await reader.loadData({
    directoryPath: DATA_DIR,
    fileExtToReader: {
      pdf: new LlamaParseReader({ resultType: "markdown" }),
    },
  });
}
