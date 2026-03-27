import { ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

export async function GET() {
  return ok(retailStore.listProducts());
}
