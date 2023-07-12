import { setup } from '@masknet/flags/build-info'
await setup()

const { render } = await import(/* webpackMode: 'eager' */ './loader.js')
const { serializer } = await import(/* webpackMode: 'eager' */ '@masknet/shared-base')
globalThis.addEventListener('message', async (event) => {
    return Promise.resolve(serializer.deserialization(event.data) as any)
        .then(render)
        .then(postMessage)
})

globalThis.postMessage('alive')
