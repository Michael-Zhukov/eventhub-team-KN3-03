import createClient from "openapi-fetch";
import type { paths } from "@eventhub/contracts";

export const api = createClient<paths>({
  baseUrl: "http://localhost:3000",
});
