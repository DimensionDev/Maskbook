;(() => {
    if (typeof browser === 'undefined' || !browser) return
    const _permissions = browser.permissions || {}
    browser.permissions = new Proxy(_permissions, {
        get(target, prop, receiver) {
            if (prop === 'request') {
                return ({ origins }) => {
                    const item = localStorage.getItem('requestedUrls')
                    const requestedUrls = JSON.parse(item) || []
                    for (const i of origins) {
                        if (!requestedUrls.includes(i)) requestedUrls.push(i)
                    }
                    localStorage.setItem('requestedUrls', JSON.stringify(requestedUrls))
                    return Promise.resolve(true)
                }
            } else if (prop === 'getAll') {
                return () => {
                    const item = localStorage.getItem('requestedUrls')
                    return Promise.resolve({ origins: JSON.parse(item) || [] })
                }
            } else if (prop === 'contains') {
                return () => Promise.resolve(true)
            } else {
                return Reflect.get(target, prop, receiver)
            }
        },
        set() {
            return false
        },
    })
})()
