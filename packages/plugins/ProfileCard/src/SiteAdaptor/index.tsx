import { Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { type EnhanceableSite } from '@masknet/shared-base'
import { base } from '../base.js'
import { EnhanceableSite_RSS3_NFT_SITE_KEY_map } from '@masknet/shared'
import { PLUGIN_ID } from '../constants.js'
import { AvatarBadge } from './AvatarBadge/AvatarBadge.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        {
            category: 'dapp',
            description: (
                <Trans>
                    View multiple accounts Web3 profile by hovering over the mini Mask icon at the corner of Avatar or
                    token tags in timeline.
                </Trans>
            ),
            ApplicationEntryID: base.ID,
            icon: <Icons.Web3ProfileCard />,
            name: <Trans>Web3 Profile Card</Trans>,
            features: [
                {
                    name: <Trans>General user</Trans>,
                    description: (
                        <Trans>
                            View user’s Web3 footprints, including NFTs, social media posts and other transaction
                            activities based on public data source.
                        </Trans>
                    ),
                },
                {
                    name: <Trans>Token</Trans>,
                    description: <Trans>View real-time crypto prices, market cap, trading volume, etc.</Trans>,
                },
                {
                    name: <Trans>NFT collection</Trans>,
                    description: (
                        <Trans>Stay on top of NFT trending information, hot projects, notable transactions, etc.</Trans>
                    ),
                },
            ],
        },
    ],
    AvatarRealm: {
        ID: `${PLUGIN_ID}_profile_card`,
        label: 'Web3 Profile Card',
        priority: 99999,
        UI: {
            Decorator: function ProfileAvatarRealmDecorator({ identity, socialAccounts }) {
                if (!identity?.identifier?.userId) return null
                const rss3Key = EnhanceableSite_RSS3_NFT_SITE_KEY_map[identity.identifier.network as EnhanceableSite]
                if (!rss3Key) return null
                return (
                    <AvatarBadge
                        userId={identity.identifier.userId}
                        identity={identity}
                        socialAccounts={socialAccounts}
                    />
                )
            },
        },
        Utils: {
            shouldDisplay() {
                return true
            },
        },
    },
}

export default site
