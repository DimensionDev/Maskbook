import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { EnhancedProfileaPage } from '../../../components/InjectedComponents/EnhancedProfile'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabPageSelector,
} from '../utils/selector'
import { getBioDescription, getNickname, getTwitterId } from '../utils/user'

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPageAtTwitter />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPageAtTwitter />)
}
export function injectEnhancedProfileAtTwitter(signal: AbortSignal) {
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
}

const EMPTY_STYLE = {} as CSSStyleDeclaration
interface StyleProps {
    backgroundColor: string
    fontFamily: string
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
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
}))

export function EnhancedProfileaPageAtTwitter() {
    const newTweetButton = searchNewTweetButtonSelector().evaluate()
    const style = newTweetButton ? window.getComputedStyle(newTweetButton) : EMPTY_STYLE
    const fontStyle = newTweetButton?.firstChild
        ? window.getComputedStyle(newTweetButton.firstChild as HTMLElement)
        : EMPTY_STYLE
    const { classes } = useStyles({ backgroundColor: style.backgroundColor, fontFamily: fontStyle.fontFamily })

    const [bio, setBio] = useState(getBioDescription())
    const [nickname, setNickname] = useState(getNickname())
    const [twitterId, setTwitterId] = useState(getTwitterId())

    const onUpdated = () => {
        setBio(getBioDescription())
        setNickname(getNickname())
        setTwitterId(getTwitterId())
    }
    return (
        <EnhancedProfileaPage
            classes={classes}
            bioDescription={bio}
            nickname={nickname}
            twitterId={twitterId}
            onUpdated={onUpdated}
        />
    )
}
