import { useEffect, useState } from 'react'
import { emitter } from './emitter.js'
import RedPacketDialog from './RedPacketDialog.js'

export function RedPacketInjection() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const unsubscribe = emitter.on('open', () => setOpen(true))
        return () => {
            unsubscribe()
        }
    }, [])

    if (!open) return null
    return <RedPacketDialog open onClose={() => setOpen(false)} />
}
