// Chrome support native ES Module in content script
import(browser.runtime.getURL('/esm/content-script.js')).catch(loadSystemJS)
// Firefox fallback to SystemJS
async function loadSystemJS(e) {
    console.warn('Load ES module failed, fallback to SystemJS', e)
    await System.import('/system/content-script.js').catch(console.error)
}
