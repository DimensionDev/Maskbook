import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useWallet } from '@masknet/web3-shared'
import { makeStyles, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import {
    searchForegroundColorSelector,
    searchProfileActiveTabSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector'
import { useEthereumAddress } from './useEthereumName'
import Color from 'color'
import { CollectibleList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

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

function clearStatus() {
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

function resetStatus() {
    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = ''
}

const bind = (cb: () => void) => {
    const elePage = searchProfileTabPageSelector().evaluate()
    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const line = v.querySelector('div > div') as HTMLDivElement
        const _v = v.querySelector('div') as HTMLDivElement
        const clickEvent = () => {
            if (elePage) elePage.style.display = ''
            if (line) line.style.display = ''
            cb()
        }
        useEffect(() => {
            _v.addEventListener('click', clickEvent, { once: true })
            return () => {
                _v.removeEventListener('click', clickEvent)
            }
        }, [line, _v, elePage, cb])
    })
}

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

    bind(() => {
        setActive(false)
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: false })
    })

    useEffect(() => {
        const clickEvent = () => {
            resetStatus()
            setActive(false)
        }
        const tab = searchProfileActiveTabSelector().evaluate()
        tab?.addEventListener('click', clickEvent, { once: true })
        return () => tab?.removeEventListener('click', clickEvent)
    }, [searchProfileActiveTabSelector, resetStatus])

    const onClick = useCallback(() => {
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: true })
        setActive(true)
        clearStatus()
    }, [clearStatus])

    if (!eleTab) return null

    return (
        <div key="nfts" className={classes.tab}>
            <div className={classNames(classes.button, active ? classes.hot : '')} onClick={onClick}>
                NFTs
                {active ? <div className={classes.active} /> : null}
            </div>
        </div>
    )
}

export function EnhancedProfileaPage() {
    const selectedWallet = useWallet()
    const [show, setShow] = useState(false)

    useEffect(() => {
        MaskMessage.events.profileNFTsPageUpdate.on((data) => {
            setShow(data.show)
        })
    }, [])

    const resolvedAddress = useEthereumAddress()

    if (!selectedWallet) {
        return null
    }

    return <>{show ? <CollectibleList wallet={selectedWallet} owner={resolvedAddress} readonly /> : null}</>
}
