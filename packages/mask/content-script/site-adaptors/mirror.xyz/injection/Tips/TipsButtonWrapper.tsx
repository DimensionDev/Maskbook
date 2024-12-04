import { memo, useMemo, useState } from 'react'
import { EMPTY_LIST, PluginID, type SocialAccount } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import {
    createInjectHooksRenderer,
    Plugin,
    useActivatedPluginsSiteAdaptor,
    useIsMinimalMode,
} from '@masknet/plugin-infra/content-script'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        marginLeft: theme.spacing(1),
        height: 40,
        width: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.maskColor.line,
        borderRadius: 20,
        marginRight: theme.spacing(1),
        color: theme.palette.text.primary,
    },
}))

interface Props {
    slot: Plugin.SiteAdaptor.TipsSlot
}

export const TipsButtonWrapper = memo(function TipsButtonWrapper({ slot }: Props) {
    const { classes } = useStyles()

    const visitingIdentity = useCurrentVisitingIdentity()
    const isMinimalMode = useIsMinimalMode(PluginID.Tips)
    const { pluginID } = useNetworkContext()
    const Utils = useWeb3Utils()
    const [disabled, setDisabled] = useState(false)

    const accounts = useMemo((): Array<SocialAccount<Web3Helper.ChainIdAll>> => {
        if (!visitingIdentity?.identifier) return EMPTY_LIST
        return [
            {
                pluginID,
                address: visitingIdentity.identifier.userId,
                label:
                    visitingIdentity.nickname ?
                        `(${visitingIdentity.nickname}) ${Utils.formatAddress(visitingIdentity.identifier.userId, 4)}`
                    :   visitingIdentity.identifier.userId,
            },
        ]
    }, [visitingIdentity, Utils.formatAddress])

    const component = useMemo(() => {
        const TipsRealm = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <TipsRealm
                identity={visitingIdentity.identifier}
                slot={slot}
                accounts={accounts}
                onStatusUpdate={setDisabled}
            />
        )
    }, [visitingIdentity.identifier, accounts, slot])

    if (disabled || !component || !visitingIdentity.identifier || isMinimalMode || location.pathname === '/')
        return null

    return (
        <span className={slot === Plugin.SiteAdaptor.TipsSlot.MirrorMenu ? classes.root : undefined}>{component}</span>
    )
})
