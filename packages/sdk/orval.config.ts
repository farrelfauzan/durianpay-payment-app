import { defineConfig } from "orval";

export default defineConfig({
  dashboard: {
    input: {
      target: "../../openapi.yaml",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated/api",
      schemas: "./src/generated/models",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
        },
      },
    },
  },
});
