import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { VCentDialog } from './TweetDialog.js'
import { base } from '../base.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    PostInspector: Component,
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans>Valuables</Trans>,
            name: <Trans>Buy & sell tweets autographed by their original creators.</Trans>,
            marketListSortingPriority: 10,
            tutorialLink: 'https://realmasknetwork.notion.site/27424923ee454a4a9b0ed16fc5cb93d0',
            icon: <Icons.Valuables size={36} />,
        },
    ],
    wrapperProps: {
        icon: (
            <Icons.Valuables
                size={24}
                style={{ filter: 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.2))' }}
                variant="light"
            />
        ),
        title: <Trans>Valuables</Trans>,
    },
}

export default site

function Component() {
    const tweetAddress = usePostInfoDetails.postID() as string | null

    if (!tweetAddress) return null
    if (!location.href.includes(`/status/${tweetAddress}`)) return null
    return (
        <EVMWeb3ContextProvider chainId={ChainId.Mainnet}>
            <VCentDialog tweetAddress={tweetAddress} />
        </EVMWeb3ContextProvider>
    )
}
