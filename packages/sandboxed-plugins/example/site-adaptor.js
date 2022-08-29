import { worker } from '@masknet/plugin/utils/rpc'
import { data } from './shared.js'
console.log(globalThis, data, await worker.echo(1, 2, new Map()))
