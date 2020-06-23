describe('dashboard - setup a account', () => {
    beforeAll(async () => {
        await page.goto('chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html')
    })

    it('take a screenshot', async () => {
        await page.screenshot({
            path: './screenshots/welcome.png',
        })
    })
})
