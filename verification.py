from playwright.sync_api import sync_playwright

def verify_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/app/verification/video", viewport={"width": 1280, "height": 720})
        page = context.new_page()

        page.goto("http://localhost:5174")
        page.wait_for_timeout(500)

        page.evaluate("""
            localStorage.setItem('nfc_tag_manager', JSON.stringify({
                settings: { adminPin: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', isAuthenticated: false, dynamicRedirection: true },
                subscription: { tier: 'free', status: 'active' },
                links: [
                    { id: 'l1', title: 'My Portfolio', url: 'https://example.com/portfolio', category: 'portfolio', clicks: 5 }
                ],
                tags: [
                    { id: 't1', label: 'Black Bracelet', assignedLinkId: 'l1', createdAt: new Date().toISOString() },
                    { id: 't2', label: 'Blue Bracelet', assignedLinkId: null, createdAt: new Date().toISOString() }
                ],
                activity: []
            }));
        """)

        # Navigate, then authenticate via the UI normally to make sure it loads all the views properly.
        page.goto("http://localhost:5174/#/login")
        page.wait_for_timeout(500)
        page.keyboard.press("1")
        page.keyboard.press("2")
        page.keyboard.press("3")
        page.keyboard.press("4")
        page.wait_for_timeout(1000)

        page.goto("http://localhost:5174/#/links")
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/links.png")

        page.goto("http://localhost:5174/#/tags")
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/tags.png")

        context.close()
        browser.close()

if __name__ == "__main__":
    verify_feature()
