import { test, expect } from "@playwright/test";

const hydrated = /^Cart \(\d+\)$/;

test("a shopper can add to cart, check out, and see a confirmation", async ({
  page,
}) => {
  // Add a product.
  await page.goto("/product/linen-desk-lamp");
  // Wait for the cart store to hydrate before clicking (the count shows a number).
  await expect(page.getByTestId("cart-count")).toHaveText(hydrated);
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-count")).toHaveText("Cart (1)");

  // Review the cart.
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-total")).toContainText("89.00 EUR");

  // Check out.
  await page.getByTestId("checkout-link").click();
  await expect(page.getByTestId("checkout-form")).toBeVisible();
  await page.getByTestId("field-fullName").fill("Test User");
  await page.getByTestId("field-email").fill("test@example.com");
  await page.getByTestId("field-address").fill("1 Test Street");
  await page.getByTestId("place-order").click();

  // Confirmation shows the server-validated order.
  await expect(page).toHaveURL(/\/checkout\/confirmation/);
  await expect(page.getByTestId("order-id")).toBeVisible();
  await expect(page.getByTestId("confirm-total")).toContainText("89.00 EUR");

  // The cart is cleared after a successful order.
  await expect(page.getByTestId("cart-count")).toHaveText("Cart (0)");
});

test("checkout cannot be started from an empty cart", async ({ page }) => {
  await page.goto("/checkout");
  const panel = page.getByTestId("state-panel");
  await expect(panel).toHaveAttribute("data-state", "empty");
  await expect(page.getByTestId("place-order")).toHaveCount(0);
});
