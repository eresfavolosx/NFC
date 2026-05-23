from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:5173/#/dashboard")
    page.wait_for_timeout(1000)

    # Navigate to links to see the emojis
    page.goto("http://localhost:5173/#/links")
    page.wait_for_timeout(1000)

    # Take screenshot at the key moment
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        os.makedirs("/home/jules/verification/videos", exist_ok=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()

        # Bypass auth
        page.goto("http://localhost:5173")
        page.evaluate("""
            localStorage.setItem('nfc_tag_manager', JSON.stringify({
                user: { id: 'admin123' },
                isAuthed: true,
                settings: {}
            }));
        """)

        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
