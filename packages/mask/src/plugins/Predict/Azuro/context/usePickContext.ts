import type { AzuroGame } from '@azuro-protocol/sdk'
import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useControlledDialog } from '../../../../utils'
import type { Odds } from '../types'

function usePickContext() {
    const {
        open: openPlaceBetDialog,
        onClose: onClosePlaceBetDialog,
        onOpen: onOpenPlaceBetDialog,
    } = useControlledDialog()
    const [conditionPick, setConditionPick] = useState<Odds | null>(null)
    const [gamePick, setGamePick] = useState<AzuroGame | null>(null)

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
