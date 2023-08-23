// Note: due to race condition between the navigation event and the executeScript,
// the content script might be injected twice.

const loaded = Symbol.for('mask_init_content_script')
if (!Reflect.get(globalThis, loaded)) {
    Reflect.set(globalThis, loaded, true)
    const { activateSiteAdaptorUI } = await import(/* webpackMode: 'eager' */ './setup.ui.js')
    const state = await activateSiteAdaptorUI()
    if (state === 'notFound' || state === 'needMaskSDK') {
        // Not found means this is not accepted by any site adaptor.
        // This can happens in the following cases:
        // - User clicked the connect button in the popup, thus we inject the content script.
        // - We have permission for this site (granted previously?) so the user expect Mask to work here.
        const { startMaskSDK } = await import('./extension/mask-sdk/index.js')
        startMaskSDK()
    }
}
export {}
