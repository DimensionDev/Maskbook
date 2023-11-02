import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { ProfileTabContent } from '../../../components/InjectedComponents/ProfileTabContent.js'
import { startWatch } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { searchProfileActiveTabSelector, searchProfileTabArticlePageSelector } from '../utils/selector.js'

export function injectProfileTabContentAtInstagram(signal: AbortSignal) {
    injectProfileTabContentHaveArticle(signal)
}

function injectProfileTabContentHaveArticle(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabArticlePageSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabContentAtInstagram />)
}

function getStyleProps() {
    const activeTab = searchProfileActiveTabSelector().evaluate() as HTMLDivElement
    return {
        backgroundColor: activeTab ? window.getComputedStyle(activeTab).backgroundColor : undefined,
        fontFamily: activeTab ? window.getComputedStyle(activeTab as HTMLElement).fontFamily : undefined,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        root: {
            position: 'relative',
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

function ProfileTabContentAtInstagram() {
    const { classes } = useStyles()
    return (
        <ProfileTabContent
            classes={{
                root: classes.root,
                button: classes.button,
                text: classes.text,
            }}
        />
    )
}
