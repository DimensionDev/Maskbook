import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useWallet, useResolveEns } from '@masknet/web3-shared'
import { makeStyles, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { CollectibleList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    searchForegroundColorSelector,
    searchProfileActiveTabLabelSelector,
    searchProfileActiveTabSelector,
    searchProfileActiveTabStatusLineSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector'
import { useEthereumName } from './useEthereumName'
import Color from 'color'

function injectEnhancedProfileTab(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileTab />)
}

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}
export function injectEnhancedProfile(signal: AbortSignal) {
    injectEnhancedProfileTab(signal)
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
}

const useEnhancedProfileStyles = makeStyles<
    Theme,
    { color: string; font: string; fontSize: string; padding: string; height: string; activeColor: string }
>((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: (props) => new Color(props.activeColor).alpha(0.1).toString(),
            cursor: 'pointer',
        },
        height: (props) => props.height,
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: (props) => props.padding,
        fontWeight: 700,
        color: (props) => props.color,
        font: (props) => props.font,
        fontSize: (props) => props.fontSize,
        '&:hover': {
            color: (props) => props.activeColor,
        },
    },
    hot: {
        color: (props) => props.activeColor,
    },
    active: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: (props) => props.activeColor,
    },
}))
export interface EnhancedProfileTabProps {}

const EMPTY_STYLE = {} as CSSStyleDeclaration

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    const eleForegroundColorStyle = searchForegroundColorSelector().evaluate()
    const foregroundColorStyle = eleForegroundColorStyle
        ? window.getComputedStyle(eleForegroundColorStyle)
        : EMPTY_STYLE
    const classes = useEnhancedProfileStyles({
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        activeColor: foregroundColorStyle.color,
    })
    const [active, setActive] = useState(false)

    const onOpen = () => setActive(false)
    const tabList = searchProfileTabListSelector().evaluate()?.querySelectorAll('div')
    tabList?.forEach((v) => {
        v.addEventListener('click', onOpen, { once: true })
    })

    const onClick = useCallback(() => {
        const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
        if (!eleTab) return

        const style = window.getComputedStyle(eleTab)

        const eleEmpty = searchProfileEmptySelector().evaluate()
        if (eleEmpty) eleEmpty.style.display = 'none'

        const ele = searchProfileTabPageSelector().evaluate()
        if (ele) ele.style.display = 'none'

        const line = searchProfileActiveTabStatusLineSelector().evaluate()
        if (line) line.style.display = 'none'

        const label = searchProfileActiveTabLabelSelector().evaluate()
        if (label) label.style.color = style.color

        const tab = searchProfileActiveTabSelector().evaluate()
        if (tab) {
            tab.setAttribute('aria-selected', 'false')
            tab.addEventListener(
                'click',
                () => {
                    if (eleEmpty) eleEmpty.style.display = 'flex'
                    if (ele) ele.style.display = 'flex'
                    if (line) line.style.display = 'inline-flex'
                    if (label) label.style.color = ''

                    setActive(false)
                    tab.setAttribute('aria-selected', 'true')
                },
                { once: true },
            )
        }

        setActive(true)
    }, [active])

    if (!eleTab) return null

    return (
        <>
            <div key="nfts" className={classes.tab}>
                <div className={classNames(classes.button, active ? classes.hot : '')} onClick={onClick}>
                    NFTs
                    {active ? <div className={classes.active} /> : null}
                </div>
            </div>
        </>
    )
}

export interface EnhancedProfilePageProps {}

export function EnhancedProfileaPage() {
    const selectedWallet = useWallet()
    const profileEthereumName = useEthereumName()
    const resolvedAddress = useResolveEns(profileEthereumName).value
    if (!selectedWallet) {
        return null
    }
    return <CollectibleList wallet={selectedWallet} owner={resolvedAddress} readonly />
}
