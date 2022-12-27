import { ErrorEditor } from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType } from '@masknet/shared-base'
import { Providers } from '../provider.js'
import type { Context, Middleware } from '../types.js'
import type { BaseContractWalletProvider } from '../providers/BaseContractWallet.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class Popups implements Middleware<Context> {
    private createProvider(context: Context) {
        return Providers[context.providerType] as BaseContractWalletProvider | undefined
    }

    private getOwner(context: Context) {
        const provider = this.createProvider(context)
        if (!provider) throw new Error('Invalid provider')

        return {
            owner: provider.owner,
            identifier: provider.identifier,
        }
    }

    async fn(context: Context, next: () => Promise<void>) {
        // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
        if (context.risky) {
            const response = await SharedContextSettings.value.send(context.request, {
                popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                ...this.getOwner(context),
            })
            const editor = ErrorEditor.from(null, response)

            if (editor.presence) {
                context.abort(editor.error)
            } else {
                context.write(response.result)
            }
        }
        await next()
    }
}
