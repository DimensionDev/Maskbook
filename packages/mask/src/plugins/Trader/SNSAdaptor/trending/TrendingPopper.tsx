import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useWindowScroll } from 'react-use'
import { ClickAwayListener, type PopperProps, Fade } from '@mui/material'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginTraderMessages } from '../../messages.js'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginTransakMessages } from '@masknet/plugin-transak'
import type { Web3Helper } from '@masknet/web3-helpers'

export interface TrendingPopperProps extends Omit<PopperProps, 'children' | 'open'> {
    children?: (
        name?: string,
        type?: TrendingAPI.TagType,
        currentResult?: Web3Helper.TokenResultAll,
        setActive?: (x: boolean) => void,
        badgeBounding?: DOMRect,
        identity?: SocialIdentity,
        address?: string,
        isCollectionProjectPopper?: boolean,
        reposition?: () => void,
    ) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper({ children, ...rest }: TrendingPopperProps) {
    const popperRef = useRef<{
        update(): void
    } | null>(null)
    const [active, setActive] = useState(false)
    const [freezed, setFreezed] = useState(false) // disable any click
    const [name, setName] = useState('')
    const [isCollectionProjectPopper, setIsNFTProjectPopper] = useState(false)
    const [identity, setIdentity] = useState<SocialIdentity | undefined>()
    const [badgeBounding, setBadgeBounding] = useState<DOMRect | undefined>()
    const [address, setAddress] = useState('')
    const [currentResult, setCurrentResult] = useState<Web3Helper.TokenResultAll>()
    const [type, setType] = useState<TrendingAPI.TagType | undefined>()
    const [initialOffsetY, setInitialOffsetY] = useState(0)

    // #region select token and provider dialog could be opened by trending view
    const onFreezed = useCallback((ev: { open: boolean }) => setFreezed(ev.open), [])
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.walletRiskWarningDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.gasSettingDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated, onFreezed)
    // #endregion

    // open popper from message center
    const position = useWindowScroll()
    useEffect(() => {
        return PluginTraderMessages.trendingAnchorObserved.on((ev) => {
            setInitialOffsetY(position.y)
            setName(ev.name)
            setCurrentResult(ev.currentResult)
            setType(ev.type)
            setBadgeBounding(ev.badgeBounding)
            setAddress(ev.address ?? '')
            setIdentity(ev.identity)
            setIsNFTProjectPopper(Boolean(ev.isCollectionProjectPopper))
            setActive(true)
        })
    }, [position.y])

    useEffect(() => {
        const onResize = () => setActive(false)

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => setActive(false), [location.state?.key, location.href])

    const badgeBoundingBottom = badgeBounding?.bottom ?? 0
    const badgeBoundingLeft = badgeBounding?.left ?? 0
    const positionY_Type = badgeBoundingBottom < 550 ? 'bottom' : 'top'
    const positionX_Type = window.innerWidth - badgeBoundingLeft < 700 ? 'right' : 'left'

    if (!type) return null

    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!freezed) setActive(false)
            }}>
            <Fade in={active} easing="linear" timeout={250}>
                <div
                    style={{
                        position: 'absolute',
                        left: positionX_Type === 'left' ? badgeBoundingLeft - 20 : badgeBoundingLeft - 300,
                        ...(positionY_Type === 'bottom'
                            ? { top: badgeBoundingBottom + initialOffsetY + 10 }
                            : { bottom: window.innerHeight - badgeBoundingBottom + 10 - initialOffsetY }),
                    }}>
                    {children?.(
                        name,
                        type,
                        currentResult,
                        setActive,
                        badgeBounding,
                        identity,
                        address,
                        isCollectionProjectPopper,
                        () => setTimeout(() => popperRef.current?.update(), 100),
                    )}
                </div>
            </Fade>
        </ClickAwayListener>
    )
}
