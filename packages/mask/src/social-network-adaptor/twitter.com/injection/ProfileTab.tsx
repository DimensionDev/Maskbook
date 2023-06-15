import Color from 'color'
import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer, startWatch, untilElementAvailable } from '../../../utils/index.js'
import type { NonFungibleCollectionResult, FungibleTokenResult } from '@masknet/web3-shared-base'
import { useSnapshotSpacesByTwitterHandler } from '@masknet/web3-hooks-base'
import { ProfileTabs, PluginID, MaskMessages, BooleanPreference } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    searchAppBarBackSelector,
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
    searchProfileTabLoseConnectionPageSelector,
    searchNameTag,
    isProfilePageLike,
} from '../utils/selector.js'
import { useCollectionByTwitterHandler } from '../../../plugins/Trader/trending/useTrending.js'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI.js'
import Services from '../../../extension/service.js'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab.js'
import { useAsync } from 'react-use'

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div > div')
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    const paddingEle = searchProfileTabSelector().evaluate()
    const paddingCss = paddingEle ? window.getComputedStyle(paddingEle) : EMPTY_STYLE
    const eleNewTweetButton = searchNewTweetButtonSelector().evaluate()
    const newTweetButtonColorStyle = eleNewTweetButton ? window.getComputedStyle(eleNewTweetButton) : EMPTY_STYLE
    const eleBackButton = searchAppBarBackSelector().evaluate()
    const backButtonColorStyle = eleBackButton ? window.getComputedStyle(eleBackButton) : EMPTY_STYLE

    return {
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        paddingX: paddingCss.paddingLeft || '16px',
        height: style.height || '53px',
        hover: backButtonColorStyle.color,
        line: newTweetButtonColorStyle.backgroundColor,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()
    return {
        root: {
            '&:hover': {
                backgroundColor: new Color(props.hover).alpha(0.1).toString(),
                cursor: 'pointer',
            },
            height: props.height,
            display: 'inline-block',
        },
        button: {
            zIndex: 1,
            position: 'relative',
            display: 'flex',
            minWidth: 56,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            paddingLeft: props.paddingX,
            paddingRight: props.paddingX,
            color: props.color,
            font: props.font,
            fontSize: props.fontSize,
            fontWeight: 500,
            '&:hover': {
                color: props.color,
            },
            height: props.height,
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
    }
})

function nameTagClickHandler() {
    MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
    MaskMessages.events.profileTabActive.sendToLocal({ active: false })
    const nameTag = searchNameTag().evaluate()
    if (nameTag) nameTag.style.display = ''

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'hidden'
        elePage.style.height = 'auto'
    }
}

function tabClickHandler() {
    MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
    MaskMessages.events.profileTabActive.sendToLocal({ active: false })

    resetTwitterActivatedContent()
}

async function hideTwitterActivatedContent() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div > div')
    const loseConnectionEle = searchProfileTabLoseConnectionPageSelector().evaluate()
    if (!eleTab) return
    const style = window.getComputedStyle(eleTab)
    // hide the activated indicator
    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector<HTMLDivElement>('div > div')
        if (_v) _v.style.color = style.color

        const line = v.querySelector<HTMLDivElement>('div > div > div')
        if (line) line.style.display = 'none'
        v.addEventListener('click', v.closest('#open-nft-button') ? nameTagClickHandler : tabClickHandler)
    })

    if (loseConnectionEle) return

    // hide the empty list indicator on the page
    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'

    const nameTag = searchNameTag().evaluate()
    if (nameTag) nameTag.style.display = 'none'

    // hide the content page
    await untilElementAvailable(searchProfileTabPageSelector())

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'hidden'
        elePage.style.height = 'auto'
    }
}

function resetTwitterActivatedContent() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div > div')
    const loseConnectionEle = searchProfileTabLoseConnectionPageSelector().evaluate()
    if (!eleTab) return

    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector<HTMLDivElement>('div > div')
        if (_v) _v.style.color = ''
        const line = v.querySelector<HTMLDivElement>('div > div > div')
        if (line) line.style.display = ''
        v.removeEventListener('click', v.closest('#open-nft-button') ? nameTagClickHandler : tabClickHandler)
    })

    if (loseConnectionEle) return

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'visible'
        elePage.style.height = 'auto'
    }
}

export function ProfileTabForTokenAndPersona() {
    const { classes } = useStyles()
    const [hidden, setHidden] = useState(false)
    const currentVisitingSocialIdentity = useCurrentVisitingIdentity()
    const currentVisitingUserId = currentVisitingSocialIdentity?.identifier?.userId
    const { value: collectionList, loading } = useCollectionByTwitterHandler(currentVisitingUserId)
    const collectionResult = collectionList?.[0]
    const twitterHandler =
        (collectionResult as NonFungibleCollectionResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>)?.collection
            ?.socialLinks?.twitter ||
        (collectionResult as FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>)?.socialLinks?.twitter

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            setHidden(data.hidden)
        })
    }, [])

    return hidden || loading ? null : (
        <ProfileTab
            title={
                currentVisitingUserId && twitterHandler?.toLowerCase().endsWith(currentVisitingUserId.toLowerCase())
                    ? 'More'
                    : 'Web3'
            }
            type={ProfileTabs.WEB3}
            classes={{
                root: classes.root,
                button: classes.button,
                selected: classes.selected,
            }}
            reset={resetTwitterActivatedContent}
            clear={hideTwitterActivatedContent}
            children={<div className={classes.line} />}
        />
    )
}

export function ProfileTabForDAO() {
    const { classes } = useStyles()
    const currentVisitingSocialIdentity = useCurrentVisitingIdentity()
    const currentVisitingUserId = currentVisitingSocialIdentity?.identifier?.userId ?? ''
    const { value: spaceList, loading } = useSnapshotSpacesByTwitterHandler(currentVisitingUserId)

    const { value: snapshotDisabled } = useAsync(() => {
        return Services.Settings.getPluginMinimalModeEnabled(PluginID.Snapshot)
    }, [])

    const [hidden, setHidden] = useState(snapshotDisabled === BooleanPreference.True)

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            setHidden(data.hidden)
        })
    }, [])

    return hidden || loading || !spaceList?.length ? null : (
        <ProfileTab
            title="DAO"
            type={ProfileTabs.DAO}
            classes={{
                root: classes.root,
                button: classes.button,
                selected: classes.selected,
            }}
            reset={resetTwitterActivatedContent}
            clear={hideTwitterActivatedContent}
            children={<div className={classes.line} />}
        />
    )
}

export function injectProfileTabAtTwitter(signal: AbortSignal) {
    let tabInjected = false
    const contentWatcher = new MutationObserverWatcher(searchProfileTabPageSelector()).useForeach(() => {
        const elePage = searchProfileTabPageSelector().evaluate()
        if (elePage && !tabInjected) {
            const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
            startWatch(watcher, {
                signal,
                missingReportRule: {
                    name: 'Last tab in the profile page',
                    rule: isProfilePageLike,
                },
            })
            attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
                <>
                    <ProfileTabForTokenAndPersona />
                    <ProfileTabForDAO />
                </>,
            )
            tabInjected = true
        }
    })

    startWatch(contentWatcher, {
        signal,
        missingReportRule: { name: 'ProfileTab', rule: isProfilePageLike },
    })
}
