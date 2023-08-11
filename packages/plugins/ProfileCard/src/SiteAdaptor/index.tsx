import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { type EnhanceableSite } from '@masknet/shared-base'
import { base } from '../base.js'
import { EnhanceableSite_RSS3_NFT_SITE_KEY_map } from '@masknet/shared'
import { PLUGIN_ID } from '../constants.js'
import { AvatarBadge } from './AvatarBadge/AvatarBadge.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ApplicationEntries: [
        {
            category: 'dapp',
            description: <Trans i18nKey="description" ns={base.ID} />,
            ApplicationEntryID: base.ID,
            icon: <Icons.Web3ProfileCard />,
            name: <Trans i18nKey="name" ns={base.ID} />,
            features: [
                {
                    name: <Trans i18nKey="plugin_avatar_feature_general_user_name" />,
                    description: <Trans i18nKey="plugin_avatar_feature_general_user_description" />,
                },
                {
                    name: <Trans i18nKey="plugin_avatar_feature_token_name" />,
                    description: <Trans i18nKey="plugin_avatar_feature_token_description" />,
                },
                {
                    name: <Trans i18nKey="plugin_avatar_feature_nft_name" />,
                    description: <Trans i18nKey="plugin_avatar_feature_nft_description" />,
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
