import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { EnhancedProfileTab } from '../../../components/InjectedComponents/EnhancedProfileTab'
import { createReactRootShadowed, startWatch } from '../../../utils'
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
import { makeStyles, Theme } from '@material-ui/core'

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

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: (props: StyleProps) => new Color(props.hover).alpha(0.1).toString(),
            cursor: 'pointer',
        },
        height: (props: StyleProps) => props.height,
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: (props: StyleProps) => props.padding,
        fontWeight: 700,
        color: (props: StyleProps) => props.color,
        font: (props: StyleProps) => props.font,
        fontSize: (props: StyleProps) => props.fontSize,
        '&:hover': {
            color: (props: StyleProps) => props.hover,
        },
    },
    selected: {
        color: (props: StyleProps) => props.hover,
    },
    line: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: (props: StyleProps) => props.line,
    },
}))

const EMPTY_STYLE = {} as CSSStyleDeclaration

function clear() {
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
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = 'none'
}

function reset() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    if (!eleTab) return

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = ''

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
    const classes = useStyles(style)
    return <EnhancedProfileTab classes={classes} reset={reset} clear={clear} />
}
