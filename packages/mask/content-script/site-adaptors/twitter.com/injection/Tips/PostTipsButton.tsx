import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Flags } from '@masknet/flags'
import { Plugin, createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { noop } from 'lodash-es'
import { memo, useMemo, useState } from 'react'
import { useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { TipButtonStyle } from '../../constant.js'
import { querySelectorAll } from '../../utils/selector.js'
import { useUserIdentity } from './hooks.js'

function postShareButtonSelector() {
    return querySelectorAll('article[data-testid="tweet"] [role="group"] > div:has([aria-haspopup="menu"]):last-child')
}

function getUserId(ele: HTMLElement) {
    const avatar = ele
        .closest('[data-testid="tweet"]')
        ?.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container-"]')
    if (!avatar) return
    return avatar.dataset.testid?.slice(21) // "UserAvatar-Container-".length === 21
}

function createRootElement() {
    const root = document.createElement('div')
    Object.assign(root.style, {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    })
    return root
}

export function injectTipsButtonOnPost(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(postShareButtonSelector())
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
                ele.style.flex = '1'

                const root = attachReactTreeWithContainer(proxy.afterShadow, {
                    signal,
                    tag: createRootElement,
                })
                root.render(<PostTipsSlot userId={userId} />)
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
}))

interface Props {
    userId: string
}

const PostTipsSlot = memo(function PostTipsSlot({ userId }: Props) {
    const themeSetting = useThemeSettings()
    const tipStyle = TipButtonStyle[themeSetting.size]
    const { classes } = useStyles()
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
                slot={Plugin.SiteAdaptor.TipsSlot.Post}
                onStatusUpdate={setDisabled}
            />
        )
    }, [identity?.identifier, tipStyle.buttonSize, tipStyle.iconSize])

    if (!identity?.identifier) return null

    return <span className={disabled ? classes.disabled : undefined}>{component}</span>
})
