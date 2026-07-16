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

const Component = createInjectHooksRenderer<
    Plugin.SiteAdaptor.Definition,
    Plugin.SiteAdaptor.AvatarRealmDecoratorProps
>(useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode, (plugin, props) => {
    const shouldDisplay =
        plugin.AvatarRealm?.Utils?.shouldDisplay?.(props.identity, props.socialAccounts, props.sourceType) ?? true
    return shouldDisplay ? plugin.AvatarRealm?.UI?.Decorator : undefined
})
export function Avatar(props: AvatarProps) {
    const { userId, sourceType } = props
    const { classes } = useStyles(undefined, { props })

    const { data: identity } = useSocialIdentityByUserId(userId)
    const [socialAccounts, { isPending: loadingSocialAccounts }] = useSocialAccountsAll(identity)

    if (loadingSocialAccounts) return null
    return (
        <div className={classes.root}>
            <Component identity={identity} socialAccounts={socialAccounts} userId={userId} sourceType={sourceType} />
        </div>
    )
}
