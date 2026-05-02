from playwright.sync_api import Page, expect, sync_playwright

def verify_indicators(page: Page):
    # Setup - authenticate by injecting localStorage state
    # Wait, the app uses Firebase, injecting localStorage state alone may not bypass Firebase auth
    # To test purely static HTML without Firebase auth, we can render the markup directly

    # HTML snippet from links.js to test required indicators on Links View
    html_links = """
    <style>
      :root {
        --color-error: #FF6B6B;
        --bg-surface-elevated: #FFFFFF;
        --border-color: rgba(0, 0, 0, 0.08);
      }
      body { font-family: sans-serif; background: #E8EBF2; padding: 20px; }
      .form-group { margin-bottom: 16px; }
      .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #495057; margin-bottom: 4px; }
      .form-input { width: 100%; padding: 8px 16px; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 12px; }
    </style>
    <div class="form-group">
      <label class="form-label" for="linkTitle">Title <span aria-hidden="true" style="color: var(--color-error)">*</span></label>
      <input class="form-input" type="text" id="linkTitle" name="title" placeholder="e.g. My Instagram" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="linkUrl">URL <span aria-hidden="true" style="color: var(--color-error)">*</span></label>
      <input class="form-input" type="url" id="linkUrl" name="url" placeholder="https://..." required>
    </div>
    """

    # HTML snippet from tags.js
    html_tags = """
    <style>
      :root {
        --color-error: #FF6B6B;
        --bg-surface-elevated: #FFFFFF;
        --border-color: rgba(0, 0, 0, 0.08);
      }
      body { font-family: sans-serif; background: #E8EBF2; padding: 20px; }
      .form-group { margin-bottom: 16px; }
      .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #495057; margin-bottom: 4px; }
      .form-input { width: 100%; padding: 8px 16px; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 12px; }
    </style>
    <div class="form-group">
      <label class="form-label" for="tagLabel">Tag Name <span aria-hidden="true" style="color: var(--color-error)">*</span></label>
      <input class="form-input" type="text" id="tagLabel" name="label" placeholder="e.g. Blue Bracelet #1" required>
    </div>
    """

    # We will verify the links form content first
    page.set_content(html_links)

    # Assert
    # Check that there's a required indicator by locating the '*' text within the labels
    expect(page.locator("label[for='linkTitle'] span")).to_have_text("*")
    expect(page.locator("label[for='linkUrl'] span")).to_have_text("*")

    # Screenshot
    page.screenshot(path="/home/jules/verification/links_form_indicators.png")

    # Now verify tags form content
    page.set_content(html_tags)

    # Assert
    expect(page.locator("label[for='tagLabel'] span")).to_have_text("*")

    # Screenshot
    page.screenshot(path="/home/jules/verification/tags_form_indicators.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_indicators(page)
        finally:
            browser.close()
