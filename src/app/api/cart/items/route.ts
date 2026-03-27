import { fail, ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

type ItemPayload = {
  cartId?: string;
  productId?: string;
  quantity?: number;
};

function parsePayload(payload: ItemPayload) {
  if (!payload.cartId || !payload.productId) {
    throw new Error("cartId and productId are required.");
  }

  return {
    cartId: payload.cartId,
    productId: payload.productId,
    quantity: payload.quantity,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ItemPayload;
    const { cartId, productId, quantity } = parsePayload(payload);
    if (typeof quantity !== "number") {
      return fail("quantity is required.", 400);
    }
    return ok(retailStore.setCartItem(cartId, productId, quantity));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as ItemPayload;
    const { cartId, productId, quantity } = parsePayload(payload);
    if (typeof quantity !== "number") {
      return fail("quantity is required.", 400);
    }
    return ok(retailStore.setCartItem(cartId, productId, quantity));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 400);
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");
  const productId = searchParams.get("productId");

  if (!cartId || !productId) {
    return fail("cartId and productId query parameters are required.", 400);
  }

  try {
    return ok(retailStore.removeCartItem(cartId, productId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 400);
  }
}
