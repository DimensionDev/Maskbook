import { memo, useCallback, useEffect, useState } from 'react'
import { emitter } from './emitter.js'
import { FriendTechDialog } from './FriendTechDialog.js'

export const FriendTechInjection = memo(function FriendTechInjection() {
    const [open, setOpen] = useState(false)
    const [address, setAddress] = useState<string>()
    useEffect(() => {
        const unsubscribe = emitter.on('open', ({ address }) => {
            setOpen(true)
            setAddress(address)
        })
        return () => {
            unsubscribe()
        }
    }, [])
    const onClose = useCallback(() => setOpen(false), [])

    if (!open) return null
    return <FriendTechDialog onClose={onClose} address={address} />
})
