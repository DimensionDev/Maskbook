import { createContainer } from 'unstated-next'
import { useState } from 'react'

function usePersonaDrawerState() {
    const [open, setOpen] = useState(false)
    return {
        open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaDrawerState = createContainer(usePersonaDrawerState)
