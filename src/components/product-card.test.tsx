import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductCard } from "@/components/product-card";

describe("ProductCard", () => {
  it("renders product details and triggers add callback", async () => {
    const onAddToCart = jest.fn(async () => undefined);

    render(
      <ProductCard
        product={{
          id: "gibson-les-paul-standard-60s",
          name: "Gibson Les Paul Standard '60s",
          description: "Classic maple top and mahogany body.",
          priceCents: 299999,
          stockOnHand: 8,
          reserved: 0,
          availableStock: 8,
        }}
        onAddToCart={onAddToCart}
      />, 
    );

    expect(screen.getByText("Gibson Les Paul Standard '60s")).toBeInTheDocument();
    expect(screen.getByText("$2,999.99")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(onAddToCart).toHaveBeenCalledWith("gibson-les-paul-standard-60s");
  });

  it("disables add button when product is sold out", () => {
    render(
      <ProductCard
        product={{
          id: "gibson-flying-v",
          name: "Gibson Flying V",
          description: "Sharp and iconic.",
          priceCents: 219999,
          stockOnHand: 0,
          reserved: 0,
          availableStock: 0,
        }}
        onAddToCart={async () => undefined}
      />, 
    );

    expect(screen.getByRole("button", { name: "Sold Out" })).toBeDisabled();
  });
});
