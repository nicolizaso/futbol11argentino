
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Verify Game 1 (Jugadores en Común)
        print("Navigating to Game 1 page...")
        page.goto("http://localhost:3000/game1")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/game1_final.png")

        # 2. Verify Game 3 (11 Argentino)
        print("Navigating to Game 3 page...")
        page.goto("http://localhost:3000/game3")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification/game3_final.png")

        browser.close()

if __name__ == "__main__":
    run()
