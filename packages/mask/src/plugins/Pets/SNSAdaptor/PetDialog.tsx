import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Constant } from '@masknet/web3-shared-evm/constants/utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { PetShareDialog } from './PetShareDialog'
import { PetSetDialog } from './PetSetDialog'

enum PetFriendNFTStep {
    SetFriendNFT = 'set',
    ShareFriendNFT = 'share',
}

export function PetDialog() {
    const { t } = useI18N()
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated, () => {})
    const [step, setStep] = useState(PetFriendNFTStep.SetFriendNFT)
    const [configNFTs, setConfigNFTs] = useState<Record<string, Constant> | undefined>(undefined)

    useAsync(async () => {
        setConfigNFTs(await PluginPetRPC.getConfigEssay())
    }, [])

    const handleSetDialogClose = () => setStep(PetFriendNFTStep.ShareFriendNFT)

    let timer: NodeJS.Timeout | null = null
    const handleClose = () => {
        closeDialog()
        if (timer !== null) clearTimeout(timer)
        timer = setTimeout(() => {
            setStep(PetFriendNFTStep.SetFriendNFT)
        }, 500)
    }

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={t(
                step === PetFriendNFTStep.SetFriendNFT ? 'plugin_pets_dialog_title' : 'plugin_pets_dialog_title_share',
            )}>
            <DialogContent>
                {step === PetFriendNFTStep.SetFriendNFT ? (
                    <PetSetDialog onClose={handleSetDialogClose} configNFTs={configNFTs} />
                ) : (
                    <PetShareDialog onClose={handleClose} />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
