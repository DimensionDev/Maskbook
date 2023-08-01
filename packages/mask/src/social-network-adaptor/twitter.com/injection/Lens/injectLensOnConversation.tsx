import { memo, useMemo, useState } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelectorAll } from '../../utils/selector.js'
import { startWatch } from '../../../../utils/startWatch.js'

const selector = () => {
    return querySelectorAll<HTMLElement>('[data-testid=conversation] div:not([tabindex]) div[dir] + div[dir]')
}

const useStyles = makeStyles()((theme) => ({
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        marginLeft: theme.spacing(0.5),
        verticalAlign: 'top',
    },
}))

interface Props {
    userId: string
}

const createRootElement = () => {
    const span = document.createElement('span')
    Object.assign(span.style, {
        verticalAlign: 'bottom',
        height: '21px',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'inline-flex',
    } as CSSStyleDeclaration)
    return span
}

const ConversationLensSlot = memo(function ConversationLensSlot({ userId }: Props) {
    const [disabled, setDisabled] = useState(true)
    const { classes, cx } = useStyles()

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.Lens?.UI?.Content,
            undefined,
            createRootElement,
        )
        const identifier = ProfileIdentifier.of(EnhanceableSite.Twitter, userId).unwrapOr(null)
        if (!identifier) return null

        return (
            <Component identity={identifier} slot={Plugin.SNSAdaptor.LensSlot.Sidebar} onStatusUpdate={setDisabled} />
        )
    }, [userId])

    if (!component) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
})

/**
 * Inject on conversation, including both DM drawer and message page (/messages/xxx)
 */
export function injectLensOnConversation(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    watcher.useForeach((node, _, proxy) => {
        const spans = node
            .closest('[data-testid=conversation]')
            ?.querySelectorAll<HTMLElement>('[tabindex] [dir] span:not([data-testid=tweetText])')
        if (!spans) return
        const userId = [...spans].reduce((id, node) => {
            if (id) return id
            if (node.textContent?.match(/@\w/)) {
                return node.textContent.trim().slice(1)
            }
            return ''
        }, '')
        if (!userId) return
        attachReactTreeWithContainer(proxy.afterShadow, { signal, untilVisible: true }).render(
            <ConversationLensSlot userId={userId} />,
        )
    })
}
