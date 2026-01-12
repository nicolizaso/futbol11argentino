
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Verify Home Page
        print("Navigating to home page...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        print("Taking home page screenshot...")
        page.screenshot(path="verification/home.png")

        # 2. Verify Login Page
        print("Navigating to login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state("networkidle")

        print("Taking login page screenshot...")
        page.screenshot(path="verification/login.png")

        browser.close()

if __name__ == "__main__":
    run()
