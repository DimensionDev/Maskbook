import { fetchGlobal } from '@masknet/web3-providers/helpers'
// eslint-disable-next-line unicorn/no-global-object-property-assignment
globalThis.fetch = fetchGlobal
