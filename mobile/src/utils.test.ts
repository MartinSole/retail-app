import { formatMoney, subtotalFromLines } from "./utils";

describe("mobile utils", () => {
  it("formats cents to USD", () => {
    expect(formatMoney(299999)).toBe("$2,999.99");
  });

  it("computes subtotal from cart lines", () => {
    const subtotal = subtotalFromLines([
      {
        productId: "gibson-sg-standard",
        name: "Gibson SG Standard",
        quantity: 2,
        unitPriceCents: 179999,
        lineTotalCents: 359998,
      },
      {
        productId: "gibson-flying-v",
        name: "Gibson Flying V",
        quantity: 1,
        unitPriceCents: 219999,
        lineTotalCents: 219999,
      },
    ]);

    expect(subtotal).toBe(579997);
  });
});
