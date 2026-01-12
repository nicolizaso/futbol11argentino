
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Verify Game 2
        print("Navigating to Game 2 page...")
        page.goto("http://localhost:3000/game2")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/game2.png")

        # 2. Verify Game 3
        print("Navigating to Game 3 page...")
        page.goto("http://localhost:3000/game3")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/game3.png")

        # 3. Verify Admin (redirect to login expected if not logged in, but we check generic render)
        print("Navigating to Admin page...")
        page.goto("http://localhost:3000/admin")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/admin_redirect.png")

        browser.close()

if __name__ == "__main__":
    run()
