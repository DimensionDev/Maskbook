import { main } from './worker'

globalThis.addEventListener('message', async () => {
    const result = await main()
    globalThis.postMessage(result)
})
globalThis.postMessage('alive')
