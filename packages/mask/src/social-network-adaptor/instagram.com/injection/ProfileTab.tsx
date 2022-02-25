import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { CollectibleIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useLocation } from 'react-use'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab'
import { createReactRootShadowed, startWatch, untilElementAvailable, useMatchXS } from '../../../utils'
import {
    searchProfileActiveTabSelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector'

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

function getStyleProps(activeColor: { activeColor: string; color: string }) {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const eleTab = searchProfileTabSelector().evaluate()
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    return {
        color: activeColor.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        hover: activeColor.activeColor,
        line: activeColor.activeColor,
    }
}

const useStyles = makeStyles<{ activeColor: string; color: string }>()((theme, { activeColor, color }) => {
    const props = getStyleProps({ activeColor, color })
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
            color: props.color,
            font: props.font,
            fontSize: props.fontSize,
            height: props.height,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            borderTop: '1px solid transparent',
        },
        selected: {
            borderTop: `1px solid ${props.hover}`,
            color: props.hover,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                borderTop: 'unset',
            },
        },
        line: {},
        icon: {
            [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: props.fontSize,
                paddingRight: 4,
            },
        },
    }
})

export function ProfileTabAtInstagram() {
    const isMobile = useMatchXS()
    const location = useLocation()
    const activeColor = useMemo(() => {
        const activeTab = searchProfileActiveTabSelector().evaluate()?.firstElementChild
        if (!activeTab) return ''
        const activeStyle = window.getComputedStyle(activeTab)
        return activeStyle.color
    }, [location])
    const color = useMemo(() => {
        const tab = searchProfileTabSelector().evaluate()
        if (!tab) return ''
        const style = window.getComputedStyle(tab)
        return style.color
    }, [location])
    const { classes } = useStyles({ activeColor, color })
    const reset = () => {
        const activeTab = searchProfileActiveTabSelector().evaluate()
        if (activeTab?.style) {
            activeTab.style.borderTop = ''
            activeTab.style.color = ''
        }

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

        Array.from(searchProfileTabPageSelector().evaluate()?.childNodes ?? []).forEach((v) => {
            const ele = v as HTMLDivElement
            if (ele.tagName !== 'SPAN') ele.style.display = ''
        })
    }
    const clear = async () => {
        const style = getStyleProps({ activeColor, color })
        const activeTab = searchProfileActiveTabSelector().evaluate()
        if (activeTab?.style) {
            activeTab.style.borderTop = 'none'
            activeTab.style.color = style.color
        }

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
        // hide the content page
        await untilElementAvailable(searchProfileTabPageSelector())

        Array.from(searchProfileTabPageSelector().evaluate()?.childNodes ?? []).forEach((v) => {
            const ele = v as HTMLDivElement
            if (ele.tagName !== 'SPAN') ele.style.display = 'none'
        })
    }
    return (
        <ProfileTab
            title="Web3"
            icon={<CollectibleIcon className={classes.icon} />}
            classes={classes}
            reset={reset}
            clear={clear}
        />
    )
}
