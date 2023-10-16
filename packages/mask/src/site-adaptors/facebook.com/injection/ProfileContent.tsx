import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { ProfileTabContent } from '../../../components/InjectedComponents/ProfileTabContent.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { profileSectionSelector, searchProfileTabPageSelector } from '../utils/selector.js'

function injectProfileTabContentState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileTabContentAtFacebook />)
}

export function injectProfileTabContentAtFacebook(signal: AbortSignal) {
    injectProfileTabContentState(signal)
}

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const profileSection = profileSectionSelector().evaluate()
    const style = profileSection ? window.getComputedStyle(profileSection) : EMPTY_STYLE
    return {
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        root: {
            position: 'relative',
            marginBottom: 16,
            paddingBottom: 16,
            background: props.backgroundColor,
            borderRadius: props.borderRadius,
            boxShadow: props.boxShadow,
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

function ProfileTabContentAtFacebook() {
    const { classes } = useStyles()
    return (
        <ProfileTabContent
            classes={{
                root: classes.root,
                text: classes.text,
                button: classes.button,
            }}
        />
    )
}
