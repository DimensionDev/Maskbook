import { main } from './worker'
import { serializer } from '@masknet/shared-base'

globalThis.addEventListener('message', async (event) => {
    const data = serializer.deserialization(event.data) as any
    const result = await main(data)
    globalThis.postMessage(result)
})

globalThis.postMessage('alive')
