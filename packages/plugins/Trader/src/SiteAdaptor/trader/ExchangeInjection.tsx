import { CrossIsolationMessages } from '@masknet/shared-base'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { useCallback, useEffect, useState } from 'react'
import { ExchangeDialog } from './ExchangeDialog.js'

export function ExchangeInjection() {
    const [open, setOpen] = useState(false)
    const [address, setAddress] = useState<string>()
    const [chainId, setChainId] = useState<number>()
    const handleClose = useCallback(() => {
        setOpen(false)
        setAddress(undefined)
        setChainId(undefined)
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.swapDialogEvent.on(({ open, traderProps }) => {
            setOpen(open)
            setAddress(traderProps?.address)
            setChainId(traderProps?.chainId)
        })
    }, [])

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <ExchangeDialog onClose={handleClose} toAddress={address} toChainId={chainId} />
        </EVMWeb3ContextProvider>
    )
}
