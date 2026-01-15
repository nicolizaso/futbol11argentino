from playwright.sync_api import sync_playwright

def verify_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Add console log listener

        context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            device_scale_factor=2
        )
        page = context.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser error: {exc}"))

        try:
            # Go to homepage
            print("Navigating to homepage...")
            page.goto("http://localhost:3001/")

            # Wait for content to load
            print("Waiting for h1...")
            # Try waiting for root first
            page.wait_for_selector('#root', state='attached', timeout=10000)
            print("Root found")

            # Wait a bit
            page.wait_for_timeout(2000)

            # Take screenshot even if h1 fails, to debug
            page.screenshot(path="/home/jules/verification/homepage_debug.png")

            page.wait_for_selector('h1', timeout=10000)

            # Take screenshot
            page.screenshot(path="/home/jules/verification/homepage_mobile.png")
            print("Homepage screenshot taken")

            # Navigate to Login
            page.goto("http://localhost:3001/login")
            page.wait_for_selector('form', timeout=10000)
            page.screenshot(path="/home/jules/verification/login_mobile.png")
            print("Login screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_homepage()
