from playwright.sync_api import sync_playwright
import time

def verify_xss_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Route firebase to our mock
        page.route("**/src/firebase.js", lambda route: route.fulfill(path="mock_firebase.js"))

        # Inject state before any JS is evaluated
        page.add_init_script("""
            const data = {
                settings: {
                    isAuthenticated: true,
                    user: { id: "1", email: "test@example.com", displayName: "Test User" },
                    brandName: 'Tocaito',
                    language: 'en'
                },
                links: [{
                    id: 'xss-test',
                    title: '<script>alert("link title XSS")</script>XSS Link',
                    url: 'javascript:alert("url XSS")',
                    category: 'general',
                    clicks: 0,
                    ownerEmail: 'test@example.com'
                }],
                tags: []
            };
            localStorage.setItem('nfc_tag_manager', JSON.stringify(data));
        """)

        # Load the application directly to the links view
        page.goto("http://localhost:5173/#/links")

        time.sleep(2) # let things settle and render

        # Take a screenshot
        page.screenshot(path="verification/links_xss_mitigated.png")

        browser.close()

if __name__ == "__main__":
    verify_xss_fix()
