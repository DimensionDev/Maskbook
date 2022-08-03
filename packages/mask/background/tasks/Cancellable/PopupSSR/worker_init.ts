import { main } from './worker'
import { serializer } from '@masknet/shared-base'

globalThis.addEventListener('message', async (event) => {
    return Promise.resolve(serializer.deserialization(event.data) as any)
        .then(main)
        .then(postMessage)
})

globalThis.postMessage('alive')
