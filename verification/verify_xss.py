from playwright.sync_api import sync_playwright
import json

def run_cuj(page):
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(500)

    mock_data = {
        "settings": {
            "brandName": "<img src=x onerror=alert('XSS')>",
            "isAuthenticated": True,
            "user": {
                "id": "test_user",
                "email": "test@example.com",
                "displayName": "Test User"
            }
        }
    }
    json_data = json.dumps(mock_data)
    # Use page.evaluate with args to safely pass the string
    page.evaluate("([key, val]) => window.localStorage.setItem(key, val)", ["nfc_tag_manager", json_data])
    page.wait_for_timeout(500)
    page.goto("http://localhost:5173/#/dashboard")
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/verification.png")
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
