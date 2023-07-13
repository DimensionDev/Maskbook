import { setupBuildInfo } from '@masknet/flags/build-info'

globalThis.addEventListener('message', async (event) => {
    await setupBuildInfo()
    const { serializer } = await import(/* webpackMode: 'eager' */ '@masknet/shared-base')
    const data = serializer.deserialization(event.data)
    const { render } = await import(/* webpackMode: 'eager' */ './loader.js')
    postMessage(await render(await data))
})

globalThis.postMessage('alive')
