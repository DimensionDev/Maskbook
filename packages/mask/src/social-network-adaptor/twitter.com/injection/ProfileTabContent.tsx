import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles, startWatch } from '@masknet/theme'
import { ProfileTabContent } from '../../../components/InjectedComponents/ProfileTabContent.js'
import { attachReactTreeWithContainer } from '../../../utils/index.js'
import {
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabPageSelector,
    searchProfileTabLoseConnectionPageSelector,
} from '../utils/selector.js'
import { MaskMessages } from '@masknet/shared-base'

function injectProfileTabContentForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, { signal, shadowRootDelegatesFocus: false })
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ProfileTabContentAtTwitter floating />,
    )
}

function injectProfileTabContentState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, { signal, shadowRootDelegatesFocus: false })
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabContentAtTwitter />)
}

export function injectProfileTabContentAtTwitter(signal: AbortSignal) {
    const contentLoseConnectionWatcher = new MutationObserverWatcher(
        searchProfileTabLoseConnectionPageSelector(),
    ).useForeach(() => MaskMessages.events.profileTabHidden.sendToLocal({ hidden: true }))

    const contentContentWatcher = new MutationObserverWatcher(searchProfileTabPageSelector()).useForeach(() =>
        MaskMessages.events.profileTabHidden.sendToLocal({ hidden: false }),
    )

    const ContentForEmptyWatcher = new MutationObserverWatcher(searchProfileEmptySelector()).useForeach(() =>
        MaskMessages.events.profileTabHidden.sendToLocal({ hidden: false }),
    )

    startWatch(contentLoseConnectionWatcher, { signal, shadowRootDelegatesFocus: false })
    startWatch(contentContentWatcher, { signal, shadowRootDelegatesFocus: false })
    startWatch(ContentForEmptyWatcher, { signal, shadowRootDelegatesFocus: false })

    injectProfileTabContentForEmptyState(signal)
    injectProfileTabContentState(signal)
}

function getStyleProps() {
    const newTweetButton = searchNewTweetButtonSelector().evaluate()
    return {
        backgroundColor: newTweetButton ? window.getComputedStyle(newTweetButton).backgroundColor : undefined,
        fontFamily: newTweetButton?.firstChild
            ? window.getComputedStyle(newTweetButton.firstChild as HTMLElement).fontFamily
            : undefined,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        holder: {
            position: 'relative',
        },
        root: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
        },
        text: {
            paddingTop: 29,
            paddingBottom: 29,
            '& > p': {
                fontSize: 28,
                fontFamily: props.fontFamily,
                fontWeight: 700,
                color: getMaskColor(theme).textPrimary,
            },
        },
        button: {
            backgroundColor: props.backgroundColor,
            color: 'white',
            marginTop: 18,
            '&:hover': {
                backgroundColor: props.backgroundColor,
            },
        },
    }
})

interface Props {
    floating?: boolean
}
export function ProfileTabContentAtTwitter({ floating }: Props) {
    const { classes } = useStyles()
    const content = (
        <ProfileTabContent
            classes={{
                root: classes.root,
                button: classes.button,
                text: classes.text,
            }}
        />
    )
    // If it's floating, for example being attached to emptyState timeline, we
    // can fix the position by putting it in a stacking context.
    return floating ? <div className={classes.holder}>{content}</div> : content
}
