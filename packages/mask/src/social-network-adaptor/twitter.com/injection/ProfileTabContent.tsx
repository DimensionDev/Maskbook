import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { ProfileTabContent } from '../../../components/InjectedComponents/ProfileTabContent'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabPageSelector,
} from '../utils/selector'

function injectProfileTabContentForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabContentAtTwitter />)
}

function injectProfileTabContentState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabContentAtTwitter />)
}

export function injectProfileTabContentAtTwitter(signal: AbortSignal) {
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
        isPositionStatic: location.pathname.endsWith('/likes') || location.pathname.endsWith('/media'),
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        root: {
            position: props.isPositionStatic ? 'static' : 'absolute',
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

export function ProfileTabContentAtTwitter() {
    const { classes } = useStyles()
    return <ProfileTabContent classes={classes} />
}
