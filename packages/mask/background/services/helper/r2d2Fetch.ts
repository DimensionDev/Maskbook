import { fetchGlobal } from '@masknet/web3-providers/helpers'

Reflect.set(globalThis, 'fetch', fetchGlobal)
