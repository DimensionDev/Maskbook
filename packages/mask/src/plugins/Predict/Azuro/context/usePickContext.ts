import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useControlledDialog } from '../../../../utils'
import type { Game, Outcome } from '../types'

function usePickContext() {
    const {
        open: openPlaceBetDialog,
        onClose: onClosePlaceBetDialog,
        onOpen: onOpenPlaceBetDialog,
    } = useControlledDialog()
    const [conditionPick, setConditionPick] = useState<Outcome | null>(null)
    const [gamePick, setGamePick] = useState<Game | null>(null)

    return {
        openPlaceBetDialog,
        onClosePlaceBetDialog,
        onOpenPlaceBetDialog,
        conditionPick,
        setConditionPick,
        gamePick,
        setGamePick,
    }
}

export const PickContext = createContainer(usePickContext)
