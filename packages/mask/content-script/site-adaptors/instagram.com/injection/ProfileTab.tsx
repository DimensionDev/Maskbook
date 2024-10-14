import { useLayoutEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-use'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { MaskMessages } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import {
    searchProfileActiveTabSelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector.js'
import { startWatch } from '../../../utils/startWatch.js'

export function injectProfileTabAtInstagram(signal: AbortSignal) {
    let tabInjected = false
    const contentWatcher = new MutationObserverWatcher(searchProfileTabPageSelector()).useForeach(() => {
        const elePage = searchProfileTabPageSelector().evaluate()
        if (elePage && !tabInjected) {
            const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
            startWatch(watcher, signal)
            attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
                <ProfileTabAtInstagram />,
            )
            tabInjected = true
        }
    })

    startWatch(contentWatcher, signal)
}

function getStyleProps(activeColor: { activeColor: string; color: string }) {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const eleTab = searchProfileTabSelector().evaluate()
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    return {
        color: activeColor.color,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        hover: activeColor.activeColor,
        line: activeColor.activeColor,
    }
}

const useStyles = makeStyles<StyleProps>()((theme, props) => {
    return {
        root: {
            '&:hover': {
                cursor: 'pointer',
            },
            display: '-webkit-box',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 60,
        },
        button: {
            fontSize: props.fontSize,
            height: props.height,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            borderTop: '1px solid transparent',
            fontWeight: 'var(--font-weight-system-semibold)',
            color: 'rgb(var(--ig-secondary-text))',
        },
        selected: {
            borderTop: `1px solid ${props.hover}`,
            color: props.hover,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                borderTop: 'unset',
            },
        },
        icon: {
            [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
                height: props.fontSize,
                width: props.fontSize,
                paddingRight: 4,
            },
        },
    }
})

interface StyleProps {
    color: string
    hover: string
    fontSize: string
    height: string
    padding: string
}

function getActiveColor() {
    const activeTab = searchProfileActiveTabSelector().evaluate()?.firstElementChild
    if (!activeTab) return ''
    const activeStyle = window.getComputedStyle(activeTab)
    return activeStyle.color
}

function getColor() {
    const tab = searchProfileTabSelector().evaluate()
    if (!tab) return ''
    const style = window.getComputedStyle(tab)
    return style.color
}

function handler() {
    MaskMessages.events.profileTabActive.sendToLocal({ active: false })
    MaskMessages.events.profileTabHidden.sendToLocal({ hidden: true })
    const activeTab = searchProfileActiveTabSelector().evaluate()
    if (activeTab?.style) {
        activeTab.style.borderTop = ''
        activeTab.style.color = ''
    }
    const ele = searchProfileTabPageSelector().evaluate()
    if (ele?.style) {
        ele.style.display = ''
    }
}

function ProfileTabAtInstagram() {
    const isMobile = useMatchXS()
    const location = useLocation()
    const [styles, setStyles] = useState<StyleProps>({
        color: '',
        hover: '',
        fontSize: '',
        height: '',
        padding: '',
    })

    const { activeColor, color } = useMemo(() => {
        const activeColor = getActiveColor()
        const color = getColor()

        return { activeColor, color }
    }, [location.pathname])

    useLayoutEffect(() => {
        const tabStyles = getStyleProps({ activeColor, color })
        setStyles(tabStyles)
    }, [])

    const { classes } = useStyles(styles)
    function reset() {
        const activeTab = searchProfileActiveTabSelector().evaluate()
        if (activeTab?.style) {
            activeTab.style.borderTop = ''
            activeTab.style.color = ''
        }
        activeTab?.removeEventListener('click', handler)

        if (isMobile) {
            const activeTab = searchProfileActiveTabSelector().evaluate()?.firstElementChild

            if (activeTab?.tagName.toUpperCase() === 'SVG') {
                const ele = activeTab as HTMLOrSVGImageElement
                if (ele.style) {
                    ele.style.color = ''
                    ele.style.fill = ''
                }
            }
        }
        const ele = searchProfileTabPageSelector().evaluate()
        if (ele?.style) {
            ele.style.display = ''
        }
    }
    function clear() {
        const style = getStyleProps({ activeColor, color })
        const activeTab = searchProfileActiveTabSelector().evaluate()
        if (activeTab?.style) {
            activeTab.style.setProperty('border-top', 'none', 'important')
            activeTab.style.color = style.color
        }

        activeTab?.addEventListener('click', handler)

        if (isMobile) {
            const activeTab = searchProfileActiveTabSelector().evaluate()?.firstElementChild
            if (activeTab?.tagName.toUpperCase() === 'SVG') {
                const ele = activeTab as HTMLOrSVGImageElement
                if (ele.style) {
                    ele.style.color = style.color
                    ele.style.fill = style.color
                }
            }
        }
        const ele = searchProfileTabPageSelector().evaluate()
        if (ele?.style) {
            ele.style.display = 'none'
        }
    }
    return (
        <ProfileTab
            title="Web3"
            icon={<Icons.Collectible className={classes.icon} />}
            classes={{
                root: classes.root,
                button: classes.button,
                selected: classes.selected,
            }}
            reset={reset}
            clear={clear}
        />
    )
}
