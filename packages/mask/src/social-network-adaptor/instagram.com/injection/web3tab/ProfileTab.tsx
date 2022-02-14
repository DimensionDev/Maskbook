import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Web3TabIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { ProfileTab } from '../../../../components/InjectedComponents/ProfileTab'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import {
    searchProfileActiveTabSelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../../utils/selector'

export function injectProfileTabAtInstagram(signal: AbortSignal) {
    let tabInjected = false

    const contentWatcher = new MutationObserverWatcher(searchProfileTabPageSelector()).useForeach(() => {
        const elePage = searchProfileTabPageSelector().evaluate()
        if (elePage && !tabInjected) {
            const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
            startWatch(watcher, signal)
            createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabAtInstagram />)
            tabInjected = true
        }
    })

    startWatch(contentWatcher, signal)
}

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration

    const eleTab = searchProfileTabSelector().evaluate() as Element
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE

    const activeTab = searchProfileActiveTabSelector().evaluate() as Element
    const activeStyle = activeTab ? window.getComputedStyle(activeTab) : EMPTY_STYLE

    return {
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        hover: activeStyle.color,
        line: activeStyle.color,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()
    return {
        root: {
            '&:hover': {
                cursor: 'pointer',
            },
            display: '-webkit-box',
            alignItems: 'center',
            justifyContent: 'center',
        },
        button: {
            color: props.color,
            font: props.font,
            fontSize: props.fontSize,
            marginLeft: 4,
            height: props.height,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
        },
        selected: {
            borderTop: `1px solid ${props.line}`,
            color: props.hover,
        },
        line: {},
        icon: {
            fontSize: props.fontSize,
            color: props.color,
            paddingRight: 4,
        },
    }
})

export function ProfileTabAtInstagram() {
    const { classes } = useStyles()

    const reset = () => {
        const activeTab = searchProfileActiveTabSelector().evaluate() as HTMLDivElement
        activeTab.style.borderTop = ''
        activeTab.style.color = ''

        Array.from(searchProfileTabPageSelector().evaluate()?.childNodes ?? []).map((v) => {
            const ele = v as HTMLDivElement
            if (ele.tagName !== 'SPAN') ele.style.visibility = ''
        })
    }
    const clear = () => {
        const style = getStyleProps()
        const activeTab = searchProfileActiveTabSelector().evaluate() as HTMLDivElement
        activeTab.style.borderTop = 'none'
        activeTab.style.color = style.color

        Array.from(searchProfileTabPageSelector().evaluate()?.childNodes ?? []).map((v) => {
            const ele = v as HTMLDivElement
            if (ele.tagName !== 'SPAN') ele.style.visibility = 'hidden'
        })
    }
    return (
        <ProfileTab
            title="Web3"
            icon={<Web3TabIcon className={classes.icon} />}
            classes={classes}
            reset={reset}
            clear={clear}
        />
    )
}
