import { fail, ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");

  if (!cartId) {
    return fail("cartId query parameter is required.", 400);
  }

  try {
    return ok(retailStore.getCart(cartId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 404);
  }
}
