import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL || "test@example.com";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "testpassword123";

test.describe("Flashcard CRUD flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();

    // Wait for redirect to /generate
    await page.waitForURL("**/generate");
  });

  test("should create, edit, and delete a flashcard", async ({ page }) => {
    // Navigate to flashcards
    await page.getByRole("link", { name: "Fiszki" }).click();
    await page.waitForURL("**/flashcards");

    // Add a new flashcard
    await page.getByRole("button", { name: /dodaj/i }).click();

    // Fill in the form
    await page.getByLabel(/przód/i).fill("Test Question");
    await page.getByLabel(/tył/i).fill("Test Answer");
    await page.getByRole("button", { name: /zapisz/i }).click();

    // Verify flashcard appears in the list
    await expect(page.getByText("Test Question")).toBeVisible();
    await expect(page.getByText("Test Answer")).toBeVisible();

    // Edit the flashcard
    await page.getByRole("button", { name: /edytuj/i }).first().click();
    await page.getByLabel(/przód/i).clear();
    await page.getByLabel(/przód/i).fill("Updated Question");
    await page.getByLabel(/tył/i).clear();
    await page.getByLabel(/tył/i).fill("Updated Answer");
    await page.getByRole("button", { name: /zapisz/i }).click();

    // Verify updated content
    await expect(page.getByText("Updated Question")).toBeVisible();
    await expect(page.getByText("Updated Answer")).toBeVisible();

    // Delete the flashcard
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /usuń/i }).first().click();

    // Verify flashcard is removed
    await expect(page.getByText("Updated Question")).not.toBeVisible();
  });
});
