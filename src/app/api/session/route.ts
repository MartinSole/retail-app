import { ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

export async function POST() {
  return ok(retailStore.startSession(), 201);
}
