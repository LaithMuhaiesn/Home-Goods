import { test, expect } from "@playwright/test";

test.describe("search within a category", () => {
  test("searching narrows the grid and updates the URL", async ({ page }) => {
    await page.goto("/category/home-goods");
    await expect(page.getByTestId("product-card")).toHaveCount(4);

    // Enter submits the GET form — works with or without hydration.
    await page.getByTestId("category-search").fill("lamp");
    await page.getByTestId("category-search").press("Enter");

    await expect(page).toHaveURL(/[?&]q=lamp/);
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByTestId("result-count")).toContainText("1 result");
  });

  test("a query reflected in the URL reproduces the filtered view on load", async ({
    page,
  }) => {
    await page.goto("/category/home-goods?q=lamp");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
  });

  test("a no-match query shows the empty state with a clear control", async ({
    page,
  }) => {
    await page.goto("/category/home-goods?q=zzzz");
    const panel = page.getByTestId("state-panel");
    await expect(panel).toHaveAttribute("data-state", "empty");
    await expect(page.getByTestId("empty-action")).toBeVisible();
    await expect(page.getByTestId("empty-action")).toHaveText("Clear search");
  });

  test("search does not leak products from other categories", async ({
    page,
  }) => {
    // "skillet" exists only in the Kitchen category.
    await page.goto("/category/home-goods?q=skillet");
    await expect(page.getByTestId("product-card")).toHaveCount(0);
    await expect(page.getByTestId("state-panel")).toHaveAttribute(
      "data-state",
      "empty",
    );
  });
});
