describe('dashboard - setup a account', () => {
    beforeAll(async () => {
        await page.goto('chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html')
    })

    it('render welcome page', async () => {
        const setupButton = await page.waitFor('a[href="#/initialize/1s"]')
        expect(await setupButton.evaluate((e) => e.textContent.toLowerCase())).toBe('set up')
    })

    it('take a screenshot', async () => {
        await page.screenshot({
            path: './screenshots/welcome.png',
        })
    })
})
