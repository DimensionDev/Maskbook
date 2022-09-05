import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo } from 'react'
import { useAsync } from 'react-use'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { normalFollowButtonSelector as selector } from '../../utils/selector'
import { getUserIdentity } from '../../utils/user'

function getTwitterId(ele: HTMLElement) {
    const profileLink = ele.closest('[data-testid="UserCell"]')?.querySelector('a[role="link"]')
    if (!profileLink) return
    return profileLink.getAttribute('href')?.slice(1)
}

export function injectTipsButtonOnFollowButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(
        watcher.useForeach((ele) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: 'closed' } })
                proxy.realCurrent = ele
                const identity = await getUserIdentity(twitterId)
                if (!identity) return

                const root = createReactRootShadowed(proxy.beforeShadow, { signal })
                root.render(<FollowButtonTipsSlot userId={twitterId} />)
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}

const useStyles = makeStyles()((theme) => ({
    slot: {
        height: 36,
        width: 36,
        position: 'absolute',
        left: -10,
        top: -2, // 2, half of (icon_height - follow_button_height)
        transform: 'translate(-100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.mode === 'dark' ? '#536471' : '#d2dbe0',
        borderRadius: '50%',
        verticalAlign: 'top',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,243,244,0.1)' : 'rgba(15,20,25,0.1)',
        },
    },
}))

interface Props {
    userId: string
}

const FollowButtonTipsSlot = memo(({ userId }: Props) => {
    const { classes } = useStyles()

    const { value: identity } = useAsync(async () => getUserIdentity(userId), [userId])
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return <Component identity={identity?.identifier} slot={Plugin.SNSAdaptor.TipsSlot.FollowButton} />
    }, [identity?.identifier])

    if (!identity?.identifier) return null

    return <span className={classes.slot}>{component}</span>
})
