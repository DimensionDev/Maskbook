{
    const system = browser.runtime.getURL('/system/')
    const esm = browser.runtime.getURL('/esm/')
    System.constructor.prototype.createContext = function (url) {
        const obj = Object.create(null)
        obj.url = url.replace(system, esm)
        return url
    }
}
// Chrome support native ES Module in content script
import(browser.runtime.getURL('/esm/content-script.js')).catch(loadSystemJS)
// Firefox fallback to SystemJS
async function loadSystemJS(e) {
    console.warn('Load ES module failed, fallback to SystemJS', e)
    await System.import('/system/content-script.js').catch(console.error)
}
