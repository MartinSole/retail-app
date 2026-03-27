import { fail, ok } from "@/lib/api-response";
import { retailStore } from "@/lib/store";

type DiscountRouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: DiscountRouteParams) {
  const { id } = await params;

  try {
    return ok(retailStore.getDiscount(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 404);
  }
}
