import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

export interface AvatarSlotProps extends withClasses<'root'> {
    identity: SocialIdentity
}

export function AvatarSlot(props: AvatarSlotProps) {
    const { identity } = props
    const classes = useStylesExtends(useStyles(), props)

    const { value: socialAddressList = EMPTY_LIST, loading: loadingSocialAddressList } =
        useSocialAddressListAll(identity)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (plugin) => {
            const shouldDisplay = plugin.AvatarRealm?.Utils?.shouldDisplay?.(identity, socialAddressList) ?? true
            return shouldDisplay ? plugin.AvatarRealm?.UI?.Decorator : undefined
        })

        return <Component identity={identity} />
    }, [])

    if (loadingSocialAddressList || !identity.identifier?.userId || !component) return null
    return <div className={classes?.root}>{component}</div>
}
