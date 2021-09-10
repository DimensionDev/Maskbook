import { useState, useEffect, useRef, useCallback } from 'react'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@material-ui/core'
import { useLocation, useWindowScroll } from 'react-use'
import { PluginTraderMessages } from '../../messages'
import { WalletMessages } from '../../../Wallet/messages'
import type { TagType } from '../../types'
import type { DataProvider, TradeProvider } from '@masknet/public-api'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTransakMessages } from '../../../Transak/messages'

export interface TrendingPopperProps {
    children?: (
        name: string,
        type: TagType,
        dataProviders: DataProvider[],
        tradeProviders: TradeProvider[],
        reposition?: () => void,
    ) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<{ update(): void } | null>(null)
    const [freezed, setFreezed] = useState(false) // disable any click
    const [locked, setLocked] = useState(false) // state is updating, lock UI
    const [name, setName] = useState('')
    const [type, setType] = useState<TagType | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [availableDataProviders, setAvailableDataProviders] = useState<DataProvider[]>([])
    const [availableTradeProviders, setAvailableTradeProviders] = useState<TradeProvider[]>([])

    //#region select token and provider dialog could be open by trending view
    const onFreezed = useCallback((ev) => setFreezed(ev.open), [])
    useRemoteControlledDialog(WalletMessages.events.transactionDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.walletConnectQRCodeDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated, onFreezed)
    //#endregion

    //#region open or close popper
    // open popper from message center
    useEffect(
        () =>
            PluginTraderMessages.cashTagObserved.on((ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setType(ev.type)
                    setAnchorEl(ev.element)
                    setAvailableDataProviders(ev.dataProviders)
                    setAvailableTradeProviders(ev.tradeProviders)
                    setLocked(false)
                }
                // observe the same element
                if (anchorEl === ev.element) return
                // close popper on previous element
                if (anchorEl) {
                    setAnchorEl(null)
                    setTimeout(update, 400)
                    return
                }
                update()
            }),
        [anchorEl],
    )

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => setAnchorEl(null), [location.state?.key, location.href])

    // close popper if scroll out of visual screen
    const position = useWindowScroll()
    useEffect(() => {
        if (!anchorEl) return
        const { top } = anchorEl.getBoundingClientRect()
        if (
            top < 0 || // out off top bound
            top > document.documentElement.clientHeight // out off bottom bound
        )
            setAnchorEl(null)
    }, [anchorEl, Math.floor(position.y / 50)])
    //#endregion

    if (locked) return null
    if (!anchorEl || !type) return null
    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!freezed) setAnchorEl(null)
            }}>
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                disablePortal
                transition
                style={{ zIndex: 100, margin: 4 }}
                popperRef={(ref) => (popperRef.current = ref)}
                {...props.PopperProps}>
                {({ TransitionProps }) => (
                    <Fade in={Boolean(anchorEl)} {...TransitionProps}>
                        <div>
                            {props.children?.(name, type, availableDataProviders, availableTradeProviders, () =>
                                setTimeout(() => popperRef.current?.update(), 100),
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
