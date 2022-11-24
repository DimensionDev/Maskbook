import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getFollowTipButtonStyle } from '../../constant.js'
import { normalFollowButtonSelector as selector } from '../../utils/selector.js'
import { getUserIdentity } from '../../utils/user.js'

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
                const buttonStyle = getFollowTipButtonStyle()
                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = ele
                const identity = await getUserIdentity(twitterId)
                if (!identity) return

                const root = createReactRootShadowed(proxy.beforeShadow, { signal })
                root.render(
                    <FollowButtonTipsSlot userId={twitterId} buttonSize={buttonStyle.buttonSize} iconSize={20} />,
                )
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
    disabled: {
        display: 'none',
    },
    slot: {
        height: 36,
        width: 36,
        position: 'absolute',
        left: -10,
        top: 1,
        transform: 'translate(-100%)',
    },
}))

interface Props {
    userId: string
    buttonSize: number
    iconSize: number
}

const FollowButtonTipsSlot = memo(({ userId, buttonSize, iconSize }: Props) => {
    const { classes, cx } = useStyles()

    const { value: identity } = useAsync(async () => getUserIdentity(userId), [userId])
    const [disabled, setDisabled] = useState(true)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )
        return (
            <Component
                identity={identity?.identifier}
                buttonSize={buttonSize}
                iconSize={iconSize}
                slot={Plugin.SNSAdaptor.TipsSlot.FollowButton}
                onStatusUpdate={setDisabled}
            />
        )
    }, [identity?.identifier, buttonSize, iconSize])

    if (!identity?.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.disabled : null)}>{component}</span>
})
