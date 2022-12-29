import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useSocialIdentityByUserId } from '../DataSource/useActivatedUI.js'
import { useMemo } from 'react'

const useStyles = makeStyles()(() => ({
    root: {},
}))

interface AvatarProps {
    userId: string
    sourceType?: Plugin.SNSAdaptor.AvatarRealmSourceType
}

export function Avatar(props: AvatarProps) {
    const { userId, sourceType } = props
    const { classes } = useStyles()

    const { value: identity } = useSocialIdentityByUserId(userId)
    const { value: socialAccounts = EMPTY_LIST, loading: loadingSocialAccounts } = useSocialAccountsAll(identity)
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => {
                const shouldDisplay =
                    plugin.AvatarRealm?.Utils?.shouldDisplay?.(identity, socialAccounts, sourceType) ?? true
                return shouldDisplay ? plugin.AvatarRealm?.UI?.Decorator : undefined
            },
        )

        return <Component identity={identity} socialAccounts={socialAccounts} userId={userId} />
    }, [identity, socialAccounts, sourceType])

    if (loadingSocialAccounts || !component) return null
    return <div className={classes.root}>{component}</div>
}
