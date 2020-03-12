export function screenshot(name: string) {
    return page.screenshot({
        path: `./screenshots/${name}.png`,
    })
}
