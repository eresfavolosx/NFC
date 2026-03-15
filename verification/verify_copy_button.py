from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to login page
        print("Navigating to login...")
        page.goto("http://localhost:5173")
        page.wait_for_selector(".login-page")

        # Enter PIN 1234
        print("Entering PIN...")
        page.click('button[data-digit="1"]')
        page.click('button[data-digit="2"]')
        page.click('button[data-digit="3"]')
        page.click('button[data-digit="4"]')

        # Wait for dashboard
        print("Waiting for dashboard...")
        page.wait_for_url("**/#/dashboard", timeout=5000)

        # Navigate to links
        print("Navigating to links...")
        page.goto("http://localhost:5173/#/links")
        page.wait_for_selector(".links-grid")

        # Check if empty state
        if page.is_visible(".empty-state"):
            print("Empty state detected. Creating link via empty state button...")
            page.click("#emptyAddLink")

            print("Waiting for modal...")
            page.wait_for_selector("#linkTitle")

            print("Filling form...")
            page.fill("#linkTitle", "Test Link")
            page.fill("#linkUrl", "https://example.com")

            print("Submitting...")
            page.click("#modalSubmit")

            print("Waiting for link card...")
            page.wait_for_selector(".link-card")

        # Check for copy button
        print("Checking for copy button...")
        # Add a small delay to ensure rendering
        time.sleep(1)

        copy_btns = page.locator(".copy-link")
        count = copy_btns.count()
        print(f"Found {count} copy buttons.")

        if count > 0:
            print("Success: Copy button found!")
            # Hover over the card
            page.locator(".link-card").first.hover()
        else:
            print("Error: Copy button NOT found!")

        # Take screenshot
        page.screenshot(path="verification/verification_fixed.png")
        print("Screenshot saved to verification/verification_fixed.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="verification/error_fixed.png")
        print("Error screenshot saved to verification/error_fixed.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
