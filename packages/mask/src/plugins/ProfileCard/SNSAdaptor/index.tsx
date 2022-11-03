import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { Box } from '@mui/material'
import { base } from '../base.js'
import { PLUGIN_ID, SNS_RSS3_FIELD_KEY_MAP } from '../constants.js'
import { setupContext } from '../context.js'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    ApplicationEntries: [
        {
            category: 'dapp',
            description: <Trans i18nKey="description" ns={base.ID} />,
            ApplicationEntryID: base.ID,
            icon: <Icons.Web3ProfileCard />,
            name: <Trans i18nKey="name" ns={base.ID} />,
        },
    ],
    AvatarRealm: {
        ID: `${PLUGIN_ID}_profile_card`,
        label: 'Avatar Web3 Profile Card',
        priority: 99999,
        UI: {
            Decorator({ identity }) {
                if (!identity?.identifier?.userId) return null
                const rss3Key = SNS_RSS3_FIELD_KEY_MAP[identity.identifier.network as EnhanceableSite]
                if (!rss3Key) return null
                return (
                    <Box display="flex" alignItems="top" justifyContent="center">
                        <div style={{ display: 'flex', alignItems: 'top', justifyContent: 'center' }}>
                            <ProfileAvatarBadge userId={identity.identifier.userId} />
                        </div>
                    </Box>
                )
            },
        },
        Utils: {
            shouldDisplay(_, socialAccounts) {
                if (!socialAccounts?.length) return false
                return !!socialAccounts.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM).length
            },
        },
    },
}

export default sns
