import { fail, ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

type CheckoutPayload = {
  cartId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload;
    if (!payload.cartId) {
      return fail("cartId is required.", 400);
    }

    const result = retailStore.checkout(payload.cartId);
    if (!result.success) {
      return fail(result.reason, 409, result.stockIssues);
    }

    return ok(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 400);
  }
}
