// Note: due to race condition between the navigation event and the executeScript,
// the content script might be injected twice.

const loaded = Symbol.for('mask_init_content_script')
if (!Reflect.get(globalThis, loaded)) {
    Reflect.set(globalThis, loaded, true)

    const { matchesAnySiteAdaptor } = await import(/* webpackMode: 'eager' */ '../shared/site-adaptors/definitions.js')
    await import(/* webpackMode: 'eager' */ '../shared-ui/initialization/index.js')
    if (matchesAnySiteAdaptor(location.href)) {
        await import('./site-adaptors/index.js')
        const { activateSiteAdaptorUI } = await import('./site-adaptor-infra/define.js')
        await activateSiteAdaptorUI()
    }
    const { startMaskSDK } = await import(/* webpackMode: 'eager' */ '../entry-sdk/index.js')
    startMaskSDK()
}
export {}
