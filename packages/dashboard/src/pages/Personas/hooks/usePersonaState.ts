import { createContainer } from 'unstated-next'
import { useState } from 'react'
import { useDefinedSocialNetworkUIs, useMyPersonas } from '../api'

function usePersonaState() {
    const [open, setOpen] = useState(false)
    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()
    const myPersonas = useMyPersonas()

    const personas = myPersonas.sort((a, b) => {
        if (a.updatedAt > b.updatedAt) return -1
        if (a.updatedAt < b.updatedAt) return 1
        return 0
    })

    return {
        drawerOpen: open,
        toggleDrawer: () => setOpen((e) => !e),
        personas,
    }
}

export const PersonaState = createContainer(usePersonaState)
