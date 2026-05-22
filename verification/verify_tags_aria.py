from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    print("Entering PIN 1234...")
    page.click('button[data-digit="1"]')
    page.wait_for_timeout(200)
    page.click('button[data-digit="2"]')
    page.wait_for_timeout(200)
    page.click('button[data-digit="3"]')
    page.wait_for_timeout(200)
    page.click('button[data-digit="4"]')
    page.wait_for_timeout(1000)

    print("Navigating to Tags view...")
    page.goto("http://localhost:5173/#/tags")
    page.wait_for_timeout(1000)

    if page.is_visible(".empty-state"):
        print("Empty state detected. Creating tag...")
        page.click("#emptyAddTag")
        page.wait_for_timeout(500)
        page.fill("#tagLabel", "Test Tag A11y")
        page.wait_for_timeout(500)
        page.click("#modalSubmit")
        page.wait_for_timeout(1000)

    print("Taking screenshot...")
    page.screenshot(path="verification/screenshots/tags_aria.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
