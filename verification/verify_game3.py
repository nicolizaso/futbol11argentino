from playwright.sync_api import sync_playwright, expect

def test_game3_search(page):
    # 1. Arrange: Go to the Game 3 page - Correct URL this time
    page.goto("http://localhost:5173/game3")

    # Wait for loading to finish
    expect(page.get_by_role("heading", name="11 Argentino")).to_be_visible(timeout=10000)

    # 2. Act: Type in the input field
    # If the input is not visible, print the page content
    input_field = page.get_by_placeholder("Nombre del jugador...")

    # Wait for input to be visible (it might take a moment after team selection)
    try:
        input_field.fill("M")
    except Exception as e:
        print(f"Error filling input: {e}")
        # Take screenshot if fill fails
        page.screenshot(path="verification/fill_error.png")
        raise e

    # 3. Assert: Suggestions should appear
    # The suggestions are likely buttons inside a container. We wait for a bit.
    page.wait_for_timeout(3000)

    # 4. Screenshot
    page.screenshot(path="verification/game3_search.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_game3_search(page)
        finally:
            browser.close()
