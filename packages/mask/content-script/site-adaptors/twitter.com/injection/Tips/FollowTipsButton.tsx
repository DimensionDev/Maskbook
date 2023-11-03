import { memo, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { makeStyles } from '@masknet/theme'
import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { TipButtonStyle } from '../../constant.js'
import { normalFollowButtonSelector as selector } from '../../utils/selector.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { isVerifiedUser } from '../../utils/AvatarType.js'
import { useUserIdentity } from './hooks.js'

function getUserId(ele: HTMLElement) {
    const profileLink = ele.closest('[data-testid="UserCell"]')?.querySelector('a[role="link"]')
    if (!profileLink) return
    return profileLink.getAttribute('href')?.slice(1)
}

export function injectTipsButtonOnFollowButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(
        watcher.useForeach((ele) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const userId = getUserId(ele)
                if (!userId) return

                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
                proxy.realCurrent = ele

                const isVerified = isVerifiedUser(ele)
                const root = attachReactTreeWithContainer(proxy.beforeShadow, { signal })

                root.render(isVerified ? <FollowButtonTipsSlot userId={userId} /> : <div />)
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

const useStyles = makeStyles()(() => ({
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
}

const FollowButtonTipsSlot = memo(function FollowButtonTipsSlot({ userId }: Props) {
    const themeSetting = useThemeSettings()
    const tipStyle = TipButtonStyle[themeSetting.size]
    const { classes, cx } = useStyles()
    const identity = useUserIdentity(userId)

    const [disabled, setDisabled] = useState(true)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )
        return (
            <Component
                identity={identity?.identifier}
                buttonSize={tipStyle.buttonSize}
                iconSize={tipStyle.iconSize}
                slot={Plugin.SiteAdaptor.TipsSlot.FollowButton}
                onStatusUpdate={setDisabled}
            />
        )
    }, [identity?.identifier, tipStyle.buttonSize, tipStyle.iconSize])

    if (!identity?.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.disabled : null)}>{component}</span>
})
