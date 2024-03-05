import { CrossIsolationMessages } from '@masknet/shared-base'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { useCallback, useEffect, useState } from 'react'
import { ExchangeDialog } from './ExchangeDialog.js'

export function ExchangeInjection() {
    const [open, setOpen] = useState(false)

    const handleClose = useCallback(() => setOpen(false), [])

    useEffect(() => {
        return CrossIsolationMessages.events.swapDialogEvent.on(({ open }) => {
            setOpen(open)
        })
    })

    if (!open) return null
    return (
        <EVMWeb3ContextProvider>
            <ExchangeDialog open={open} onClose={handleClose} />
        </EVMWeb3ContextProvider>
    )
}
