import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { useWallet } from '@masknet/web3-shared'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { CollectibleList } from '../../../extension/options-page/DashboardComponents/CollectibleList'
import {
    searchProfileActiveTabLabelSelector,
    searchProfileActiveTabSelector,
    searchProfileActiveTabStatusLineSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
} from '../utils/selector'

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

const useEnhancedProfileStyles = makeStyles((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
            cursor: 'pointer',
        },
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: theme.spacing(2),
        fontWeight: 700,
        color: 'rgb(83, 100, 113)',
    },
    hot: {
        color: 'rgb(29, 161, 242)',
    },
    active: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: 'rgb(29, 161, 242)',
    },
}))
export interface EnhancedProfileTabProps {}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const classes = useEnhancedProfileStyles()
    const [active, setActive] = useState(false)

    const onOpen = () => setActive(false)
    const tabList = searchProfileTabListSelector().evaluate()?.querySelectorAll('div')
    tabList?.forEach((v, i) => {
        v.addEventListener('click', onOpen, { once: true })
    })

    const onClick = useCallback(() => {
        const eleEmpty = searchProfileEmptySelector().evaluate()
        if (eleEmpty) eleEmpty.style.display = 'none'

        const ele = searchProfileTabPageSelector().evaluate()
        if (ele) ele.style.display = 'none'

        const line = searchProfileActiveTabStatusLineSelector().evaluate()
        if (line) line.style.display = 'none'

        const label = searchProfileActiveTabLabelSelector().evaluate()
        if (label) label.style.color = 'rgb(83, 100, 113)'

        const tab = searchProfileActiveTabSelector().evaluate()
        if (tab) {
            tab.addEventListener(
                'click',
                () => {
                    if (eleEmpty) eleEmpty.style.display = 'flex'
                    if (ele) ele.style.display = 'flex'
                    if (line) line.style.display = 'inline-flex'
                    if (label) label.style.color = ''

                    setActive(false)
                    console.log('tab')
                },
                { once: true },
            )
        }

        setActive(true)
    }, [active])
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

export function EnhancedProfileaPage(props: EnhancedProfilePageProps) {
    const selectedWallet = useWallet()
    if (!selectedWallet) {
        return null
    }
    return <CollectibleList wallet={selectedWallet} readonly />
}
