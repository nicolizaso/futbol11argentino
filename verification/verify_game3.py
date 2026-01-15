
from playwright.sync_api import sync_playwright, expect

def test_game3_visuals(page):
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))
    page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

    # Go to Home
    print("Navigating to Home...")
    page.goto("http://localhost:3000/")

    # Wait for loading
    page.wait_for_timeout(2000)

    # Check if WIP screen is present
    if page.get_by_placeholder("Contraseña de acceso").is_visible():
        print("WIP Screen detected.")
        # Try to continue anyway? No, blocking.
        # But we assume WIP is off in dev if .env is missing.
        # The logs showed "Missing environment variables" and no VITE_WIP_MODE.
        pass

    # Navigate to Game 3 (Correct Route)
    print("Navigating to Game 3...")
    page.goto("http://localhost:3000/game3")

    # Wait for the game to initialize
    page.wait_for_timeout(3000)

    # 1. Check Title "11 Argentino"
    heading = page.get_by_role("heading", name="11 Argentino")
    if not heading.is_visible():
         print("Heading not found. Check if stuck on loading.")
         page.screenshot(path="verification/game3_debug.png")

    expect(heading).to_be_visible()

    # 2. Check Pitch Elements
    # 0/11 Jugadores
    expect(page.get_by_text("/11 Jugadores")).to_be_visible()

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/game3_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_game3_visuals(page)
            print("Test passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/game3_error.png")
        finally:
            browser.close()
