import { PrismaClient } from "@prisma/client";
import { EngineResponse, PGVectorStore, VectorStoreIndex } from "llamaindex";

const prisma = new PrismaClient();

export async function deleteEmbeddingsByUrl(url: string) {
  const tableExists = await tableEmbeddingExists();
  if (!tableExists) {
    return;
  }

  if (!prisma.llamaindex_embedding) {
    throw new Error(
      "prisma.llamaindex_embedding is not defined. run `npx prisma generate`"
    );
  }

  await prisma.llamaindex_embedding.deleteMany({
    where: {
      metadata: {
        path: ["url"],
        equals: url,
      },
    },
  });
}

let pgVectorStore: null | PGVectorStore = null;
export function getPGVectorStore() {
  if (pgVectorStore !== null) {
    return pgVectorStore;
  }

  pgVectorStore = new PGVectorStore({
    clientConfig: {
      database: process.env.DATABASE_DATABASE,
      port: process.env.DATABASE_PORT
        ? Number(process.env.DATABASE_PORT)
        : 5432,
      host: process.env.DATABASE_HOST ?? "localhost",
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
  });

  return pgVectorStore;
}

export async function getPGVectorIndex() {
  const pgVectorStore = getPGVectorStore();
  const index = await VectorStoreIndex.fromVectorStore(pgVectorStore);
  return index;
}

export async function queryPGVectorStoreReducedData(query: string) {
  const response = await queryPGVectorStore(query);
  return getDataFromResponse(response);
}

export async function queryPGVectorStore(query: string) {
  const index = await getPGVectorIndex();
  const queryEngine = index.asQueryEngine({
    similarityTopK: 5,
  });
  const response = await queryEngine.query({ query: query });
  return response;
}

function getDataFromResponse(response: EngineResponse) {
  return response.sourceNodes?.map((node) => {
    const data = node.node.toJSON();
    return {
      text: data.text ?? "",
      url: data?.metadata?.url ?? "",
      title: data?.metadata?.title ?? "",
      score: node.score,
    };
  });
}

// check the database using prisma js if the table llamaindex_embeddings exists
async function tableEmbeddingExists() {
  const tableExists = await prisma.$queryRaw<Array<{ count: 0 | 1 }>>`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_name = 'llamaindex_embedding'`;
  return !!tableExists[0].count;
}
