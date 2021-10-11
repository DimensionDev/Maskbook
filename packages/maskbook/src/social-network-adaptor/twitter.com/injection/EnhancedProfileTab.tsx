import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { EnhancedProfileTab } from '../../../components/InjectedComponents/EnhancedProfileTab'
import { createReactRootShadowed, startWatch, untilElementAvailable } from '../../../utils'
import {
    searchForegroundColorSelector,
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector'
import Color from 'color'
import { makeStyles } from '@masknet/theme'

export function injectEnhancedProfileTabAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileTabAtTwitter />)
}

interface StyleProps {
    color: string
    font: string
    fontSize: string
    padding: string
    height: string
    hover: string
    line: string
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        '&:hover': {
            backgroundColor: new Color(props.hover).alpha(0.1).toString(),
            cursor: 'pointer',
        },
        height: props.height,
    },
    button: {
        zIndex: 1,
        position: 'relative',
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: props.padding,
        color: props.color,
        font: props.font,
        fontSize: props.fontSize,
        fontWeight: 500,
        '&:hover': {
            color: props.color,
        },
    },
    selected: {
        color: `${props.hover} !important`,
        fontWeight: 700,
    },
    line: {
        borderRadius: 9999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: props.line,
    },
}))

const EMPTY_STYLE = {} as CSSStyleDeclaration

async function clear() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    if (!eleTab) return
    const style = window.getComputedStyle(eleTab)
    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector('div') as HTMLDivElement
        _v.style.color = style.color
        const line = v.querySelector('div > div') as HTMLDivElement
        line.style.display = 'none'
    })

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'

    // set display: none will change the height of the original element
    await untilElementAvailable(searchProfileTabPageSelector())
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.visibility = 'hidden'
}

function reset() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    if (!eleTab) return

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.visibility = 'visible'

    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector('div') as HTMLDivElement
        _v.style.color = ''
        const line = v.querySelector('div > div') as HTMLDivElement
        line.style.display = ''
    })
}

function getStyle() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    const eleNewTweetButton = searchNewTweetButtonSelector().evaluate()
    const newTweetButtonColorStyle = eleNewTweetButton ? window.getComputedStyle(eleNewTweetButton) : EMPTY_STYLE
    const eleBackButton = searchForegroundColorSelector().evaluate()
    const backButtonColorStyle = eleBackButton ? window.getComputedStyle(eleBackButton) : EMPTY_STYLE

    return {
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        hover: backButtonColorStyle.color,
        line: newTweetButtonColorStyle.backgroundColor,
    } as StyleProps
}

export function EnhancedProfileTabAtTwitter() {
    const style = getStyle()
    const { classes } = useStyles(style)
    return (
        <EnhancedProfileTab classes={classes} reset={reset} clear={clear} children={<div className={classes.line} />} />
    )
}
