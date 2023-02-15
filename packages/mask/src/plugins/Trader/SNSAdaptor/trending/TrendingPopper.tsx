import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useWindowScroll } from 'react-use'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@mui/material'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginTraderMessages } from '../../messages.js'
import { WalletMessages } from '../../../Wallet/messages.js'
import { PluginTransakMessages } from '@masknet/plugin-transak'
import type { PopperUnstyledOwnProps } from '@mui/base'

export interface TrendingPopperProps extends Omit<PopperProps, 'children' | 'open'> {
    children?: (
        name?: string,
        type?: TrendingAPI.TagType,
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
    const [type, setType] = useState<TrendingAPI.TagType | undefined>()
    const [anchorEl, setAnchorEl] = useState<PopperUnstyledOwnProps['anchorEl']>(null)
    const popper = useRef<HTMLDivElement | null>(null)
    // #region select token and provider dialog could be opened by trending view
    const onFreezed = useCallback((ev: { open: boolean }) => setFreezed(ev.open), [])
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated, onFreezed)
    // #endregion

    // #region open or close popper
    // open popper from message center
    useEffect(() => {
        return PluginTraderMessages.trendingAnchorObserved.on((ev) => {
            setName(ev.name)
            setType(ev.type)
            setBadgeBounding(ev.badgeBounding)
            setAddress(ev.address ?? '')
            setIdentity(ev.identity)
            setIsNFTProjectPopper(Boolean(ev.isCollectionProjectPopper))
            setAnchorEl({ getBoundingClientRect: () => ev.badgeBounding })
            setActive(true)
        })
    }, [])

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => setActive(false), [location.state?.key, location.href])

    // close popper if scroll out of visual screen
    const position = useWindowScroll()
    useEffect(() => {
        if (!popper.current) return
        const { top, height } = popper.current.getBoundingClientRect()
        if ((top < 0 && -top > height) || top > document.documentElement.clientHeight) {
            // out off bottom bound
            setActive(false)
        }
    }, [popper, Math.floor(position.y / 50)])
    // #endregion

    if (!type) return null

    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!freezed) setActive(false)
            }}>
            <Popper
                ref={popper}
                open={active}
                anchorEl={anchorEl}
                style={{ zIndex: 100 }}
                popperRef={(ref) => (popperRef.current = ref)}
                transition
                disablePortal
                popperOptions={{
                    strategy: 'absolute',
                    modifiers: [
                        {
                            name: 'preventOverflow',
                            options: {
                                tether: false,
                                rootBoundary: 'viewport',
                                padding: 4,
                            },
                        },
                    ],
                }}
                {...rest}>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        <div>
                            {children?.(
                                name,
                                type,
                                setActive,
                                badgeBounding,
                                identity,
                                address,
                                isCollectionProjectPopper,
                                () => setTimeout(() => popperRef.current?.update(), 100),
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
