import { test, expect } from "@playwright/test";

const STATES = ["loading", "empty", "error", "success"] as const;

test.describe("category page", () => {
  test("success renders the header and exactly four product cards", async ({
    page,
  }) => {
    const response = await page.goto("/category/home-goods");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByTestId("page-header")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();

    const cards = page.getByTestId("product-card");
    await expect(cards).toHaveCount(4);

    const firstHref = await cards.first().getAttribute("href");
    expect(firstHref).toMatch(/^\/product\//);
  });

  for (const state of STATES) {
    test(`renders the ${state} state`, async ({ page }) => {
      await page.goto(`/category/home-goods?demoState=${state}`);
      await expect(page.getByTestId("page-header")).toBeVisible();
      const panel = page.getByTestId("state-panel");
      await expect(panel).toHaveAttribute("data-state", state);
      if (state === "error") {
        await expect(page.getByTestId("retry")).toBeVisible();
      }
    });
  }
});

test.describe("product page", () => {
  test("success renders the header, detail and product name", async ({
    page,
  }) => {
    const response = await page.goto("/product/linen-desk-lamp");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByTestId("page-header")).toBeVisible();
    await expect(page.getByTestId("product-detail")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Linen Desk Lamp" }),
    ).toBeVisible();
  });

  for (const state of STATES) {
    test(`renders the ${state} state`, async ({ page }) => {
      await page.goto(`/product/linen-desk-lamp?demoState=${state}`);
      await expect(page.getByTestId("page-header")).toBeVisible();
      const panel = page.getByTestId("state-panel");
      await expect(panel).toHaveAttribute("data-state", state);
      if (state === "error") {
        await expect(page.getByTestId("retry")).toBeVisible();
      }
    });
  }
});

test("navigating from category to a product opens the detail page", async ({
  page,
}) => {
  await page.goto("/category/home-goods");
  await page.getByTestId("product-card").first().click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByTestId("product-detail")).toBeVisible();
});
