import { useState } from 'react'

export function useControlledDialog() {
    const [open, setOpen] = useState(false)
    return {
        open,
        setOpen,
        onClose: () => setOpen(false),
        onOpen: () => setOpen(true),
    }
}
