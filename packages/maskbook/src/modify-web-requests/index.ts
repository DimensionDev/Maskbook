const crossDomainHeaders: browser.webRequest.HttpHeaders = [
    { name: 'access-control-allow-origin', value: '*' },
    { name: 'access-control-allow-methods', value: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS' },
    { name: 'access-control-allow-headers', value: '*' },
    { name: 'access-control-expose-headers', value: '*' },
]

browser.webRequest.onBeforeSendHeaders.addListener(
    (event) => {
        const requestHeaders = event.requestHeaders ?? []
        const { hostname } = new URL(event.url)
        if (hostname === 'api-v4.zerion.io') {
            modifyHeaders(requestHeaders, [{ name: 'origin', value: 'http://mask.io' }])
        }
        return
    },
    { urls: ['<all_urls>'] },
    ['blocking', 'requestHeaders'],
)

browser.webRequest.onHeadersReceived.addListener(
    (event) => {
        const responseHeaders = event.responseHeaders ?? []
        modifyHeaders(responseHeaders, crossDomainHeaders)
        return { responseHeaders }
    },
    { urls: ['<all_urls>'] },
    ['blocking', 'responseHeaders'],
)

function modifyHeaders(baseHeaders: browser.webRequest.HttpHeaders, newHeaders: browser.webRequest.HttpHeaders) {
    newHeaders.forEach((header) => {
        const position = baseHeaders.findIndex(({ name }) => name.toLowerCase() === header.name)
        if (position !== -1) {
            baseHeaders[position] = header
        } else {
            baseHeaders.push(header)
        }
    })
}

export {}
