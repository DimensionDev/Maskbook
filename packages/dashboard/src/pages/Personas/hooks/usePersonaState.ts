import { createContainer } from 'unstated-next'
import { useState } from 'react'

function usePersonaState() {
    const [open, setOpen] = useState(false)

    return {
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
    }
}

export const PersonaState = createContainer(usePersonaState)
