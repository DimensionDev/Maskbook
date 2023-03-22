// Note: due to race condition between the navigation event and the executeScript,
// the content script might be injected twice.

const loaded = Symbol.for('mask_init_content_script')
if (!Reflect.get(globalThis, loaded)) {
    Reflect.set(globalThis, loaded, true)
    import(/* webpackMode: 'eager' */ '@masknet/injected-script').then(({ setup }) => setup())
    import(/* webpackMode: 'eager' */ './setup.ui.js')
}
