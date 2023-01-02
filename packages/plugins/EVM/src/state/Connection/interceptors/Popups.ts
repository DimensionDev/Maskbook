import { isUndefined, omitBy } from 'lodash-es'
import { ErrorEditor } from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType } from '@masknet/shared-base'
import type { Context, Middleware } from '../types.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class Popups implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
        if (context.risky) {
            const response = await SharedContextSettings.value.send(
                context.request,
                omitBy(
                    {
                        owner: context.owner,
                        identifier: context.identifier,
                        popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                    },
                    isUndefined,
                ),
            )
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
