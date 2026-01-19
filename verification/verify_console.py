from playwright.sync_api import sync_playwright

def run(page):
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating...")
    page.goto("http://localhost:5173/game/3")
    print("Navigated. Waiting...")
    page.wait_for_timeout(5000)
    print("Done waiting.")

    page.screenshot(path="verification/console_debug.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run(page)
        finally:
            browser.close()
