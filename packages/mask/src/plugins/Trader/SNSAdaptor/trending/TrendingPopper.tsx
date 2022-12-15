import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useWindowScroll, useAsyncRetry } from 'react-use'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@mui/material'
import type { NonFungibleTokenResult, FungibleTokenResult } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import { PluginTraderMessages } from '../../messages.js'
import { WalletMessages } from '../../../Wallet/messages.js'
import { PluginTransakMessages } from '../../../Transak/messages.js'

export interface TrendingPopperProps {
    children?: (
        resultList: Array<
            | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
            | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >,
        reposition?: () => void,
    ) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<{
        update(): void
    } | null>(null)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const [freezed, setFreezed] = useState(false) // disable any click
    const [locked, setLocked] = useState(false) // state is updating, lock UI
    const [name, setName] = useState('')
    const [type, setType] = useState<TrendingAPI.TagType | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const popper = useRef<HTMLDivElement | null>(null)

    const { value: _resultList } = useAsyncRetry(async () => {
        if (!name || !type || !connection?.getAddressType) return
        const tag = type === TrendingAPI.TagType.CASH ? '$' : '#'
        const list = await DSearch.search(`${tag}${name}`, {
            getAddressType: connection?.getAddressType,
        })
        return list
    }, [name, type, connection?.getAddressType])

    const resultList = _resultList as Array<
        | NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >
    // #region select token and provider dialog could be opened by trending view
    const onFreezed = useCallback((ev: { open: boolean }) => setFreezed(ev.open), [])
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated, onFreezed)
    // #endregion

    // #region open or close popper
    // open popper from message center
    useEffect(
        () =>
            PluginTraderMessages.cashTagObserved.on((ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setType(ev.type)
                    setAnchorEl(ev.element)
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
        if (!popper.current) return
        const { top, height } = popper.current.getBoundingClientRect()
        if ((top < 0 && -top > height) || top > document.documentElement.clientHeight) {
            // out off bottom bound
            setAnchorEl(null)
        }
    }, [popper, Math.floor(position.y / 50)])
    // #endregion

    if (locked) return null
    if (!anchorEl || !type) return null
    if (!resultList?.length) return null
    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!freezed) setAnchorEl(null)
            }}>
            <Popper
                ref={popper}
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
                            {props.children?.(resultList, () => setTimeout(() => popperRef.current?.update(), 100))}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
