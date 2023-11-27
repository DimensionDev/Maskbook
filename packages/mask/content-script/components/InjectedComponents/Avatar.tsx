import { useMemo } from 'react'
import { createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import type { Plugin } from '@masknet/plugin-infra'
import { makeStyles } from '@masknet/theme'
import { useSocialIdentityByUserId } from '../DataSource/useActivatedUI.js'

const useStyles = makeStyles()(() => ({
    root: {},
}))

interface AvatarProps extends withClasses<'root'> {
    userId: string
    sourceType?: Plugin.SiteAdaptor.AvatarRealmSourceType
}

export function Avatar(props: AvatarProps) {
    const { userId, sourceType } = props
    const { classes } = useStyles(undefined, { props })

    const { data: identity } = useSocialIdentityByUserId(userId)
    const [socialAccounts, { isPending: loadingSocialAccounts }] = useSocialAccountsAll(identity)
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
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
