import { EthereumMethodType, type Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { disablePermitSettings } from '@masknet/shared-base'

const PERMIT_SELECTOR = '0x8fcbaf0c'
export class Permit implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (context.method !== EthereumMethodType.eth_sign || !disablePermitSettings.value) {
            await next()
            return
        }
        const params = context.request.params || []
        if (params.some((x) => x.data?.startsWith?.(PERMIT_SELECTOR))) {
            context.abort(new Error('The Permit method has been disabled.'))
        }
        await next()
    }
}
