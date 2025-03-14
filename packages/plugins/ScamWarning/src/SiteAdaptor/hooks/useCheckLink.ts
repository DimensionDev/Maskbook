import { resolveTCOLink } from '@masknet/plugin-infra/dom/context'
import { GoPlusLabs } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { SecurityProvider } from '../../constants.js'
import { PluginScamRPC } from '../../messages.js'
import { extractAddresses } from '../../utils.js'

function isTCO(url: string | null) {
    if (!url) return false
    return url.startsWith('https://t.co/')
}

export function useCheckLink(link: string, text: string) {
    return useQuery({
        queryKey: ['scam-warning', 'check-link', link, text],
        queryFn: async () => {
            const resolvedLink = isTCO(link) ? await resolveTCOLink(link) : link
            if (!resolvedLink) return { isScam: false }
            const result = await PluginScamRPC.checkUrl(resolvedLink)
            if (result)
                return {
                    isScam: result,
                    provider: SecurityProvider.ScamSniffer,
                    resolvedLink,
                }
            const isEllipsis = text.endsWith('…')
            // We assume that the link contains only one address
            const address = isEllipsis ? extractAddresses(resolvedLink, true)[0] : undefined

            return {
                isScam: await GoPlusLabs.checkIsPhishingSite(resolvedLink),
                provider: SecurityProvider.GoPlus,
                resolvedLink,
                address,
            }
        },
    })
}
