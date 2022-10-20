import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { Box } from '@mui/material'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { PluginIDContextProvider } from '@masknet/web3-hooks-base'
import { SocialAddressType } from '@masknet/web3-shared-base'
import { NetworkPluginID, parseURLs } from '@masknet/shared-base'
import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { PostInspector } from './PostInspector.js'
import { base } from '../base.js'
import { getPayloadFromURLs } from '../helpers/index.js'
import { setupContext } from '../context.js'
import { PLUGIN_ID, PLUGIN_NAME } from '../constants.js'
import { DialogInspector } from './DialogInspector.js'
import { CollectionList } from './List/CollectionList.js'

const TabConfig: Plugin.SNSAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_nfts`,
    label: 'NFTs',
    priority: 1,
    UI: {
        TabContent({ socialAccount: socialAddress, identity }) {
            if (!socialAddress) return null
            return (
                <PluginIDContextProvider value={socialAddress.pluginID}>
                    <CollectionList socialAddress={socialAddress} persona={identity?.publicKey} profile={identity} />
                </PluginIDContextProvider>
            )
        },
    },
    Utils: {
        sorter: (a, z) => {
            if (a.type === SocialAddressType.ENS) return -1
            if (z.type === SocialAddressType.ENS) return 1

            if (a.type === SocialAddressType.RSS3) return -1
            if (z.type === SocialAddressType.RSS3) return 1

            if (a.type === SocialAddressType.Address) return -1
            if (z.type === SocialAddressType.Address) return 1

            return 0
        },
    },
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection() {
        return (
            <>
                <DialogInspector />
            </>
        )
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        const payload = getPayloadFromURLs(links)
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    DecryptedInspector(props) {
        const links = parseURLs(extractTextFromTypedMessage(props.message, { linkAsText: true }).unwrapOr(''))
        const payload = getPayloadFromURLs(links)
        usePluginWrapper(!!payload)
        return payload ? <PostInspector payload={payload} /> : null
    },
    ProfileTabs: [TabConfig],
    ProfileCardTabs: [
        {
            ...TabConfig,
            priority: 2,
            UI: {
                TabContent({ socialAccount: socialAddress, identity }) {
                    if (!socialAddress) return null
                    return (
                        <Box pr={1.5}>
                            <PluginIDContextProvider value={socialAddress.pluginID}>
                                <CollectionList
                                    socialAddress={socialAddress}
                                    persona={identity?.publicKey}
                                    profile={identity}
                                />
                            </PluginIDContextProvider>
                        </Box>
                    )
                },
            },
            Utils: {
                ...TabConfig.Utils,
                shouldDisplay(identity, socialAddress) {
                    return socialAddress?.pluginID === NetworkPluginID.PLUGIN_EVM
                },
            },
        },
    ],
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_collectibles_description" />,
            name: <Trans i18nKey="plugin_collectibles_name" />,
            icon: <Icons.Collectibles size={36} />,
            marketListSortingPriority: 7,
            tutorialLink: 'https://realmasknetwork.notion.site/c388746f11774ecfa17914c900d3ed97',
        },
    ],
    wrapperProps: {
        title: PLUGIN_NAME,
        icon: <Icons.ApplicationNFT size={24} />,
    },
}

export default sns
