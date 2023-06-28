import { memo, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginTransakMessages } from '../messages.js'
import { BuyTokenDialog } from './BuyTokenDialog.js'

export const BuyTokenGlobalInjection = memo(function BuyTokenGlobalInjection() {
    const [code, setCode] = useState('ETH')
    const [address, setAddress] = useState('')
    const { open, closeDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setCode(ev.code ?? 'ETH')
        setAddress(ev.address)
    })
    if (!open) return null
    return <BuyTokenDialog open onClose={closeDialog} code={code} address={address} />
})
