const urls = ['*://gitcoin.co/*', '*://web-api.coinmarketcap.com/*', '*://v.cent.co/*']

browser.webRequest.onHeadersReceived.addListener(
    (event) => {
        const responseHeaders = event.responseHeaders ?? []
        modifyHeaders(responseHeaders, [
            { name: 'access-control-allow-origin', value: '*' },
            { name: 'access-control-allow-methods', value: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS' },
            { name: 'access-control-allow-headers', value: '*' },
            { name: 'access-control-expose-headers', value: '*' },
        ])
        return { responseHeaders }
    },
    { urls },
    ['blocking', 'responseHeaders'],
)

function modifyHeaders(baseHeaders: browser.webRequest.HttpHeaders, newHeaders: browser.webRequest.HttpHeaders) {
    newHeaders.forEach((header) => {
        const index = baseHeaders.findIndex(({ name }) => name.toLowerCase() === header.name)
        if (index !== -1) {
            baseHeaders[index] = header
        } else {
            baseHeaders.push(header)
        }
    })
}

export {}
