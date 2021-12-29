import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { EnhancedProfilePage } from '../../../plugins/Profile/SNSAdaptor/EnhancedProfile'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabPageSelector,
} from '../utils/selector'

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfilePageAtTwitter />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfilePageAtTwitter />)
}

export function injectEnhancedProfileAtTwitter(signal: AbortSignal) {
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
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

export function EnhancedProfilePageAtTwitter() {
    const { classes } = useStyles()
    return <EnhancedProfilePage classes={classes} />
}
