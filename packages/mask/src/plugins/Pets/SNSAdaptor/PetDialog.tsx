import { useState } from 'react'
import { useAsync, useTimeout } from 'react-use'
import type { Constant } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { PluginPetMessages, PluginPetRPC } from '../messages'
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
    const [isReady, cancel] = useTimeout(500)

    useAsync(async () => {
        setConfigNFTs(await PluginPetRPC.getConfigEssay())
    }, [])

    const handleSetDialogClose = () => setStep(PetFriendNFTStep.ShareFriendNFT)

    const handleClose = () => {
        closeDialog()
        isReady() ? setStep(PetFriendNFTStep.SetFriendNFT) : cancel()
    }

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={t(
                step === PetFriendNFTStep.SetFriendNFT ? 'plugin_pets_dialog_title' : 'plugin_pets_dialog_title_share',
            )}>
            <DialogContent style={{ padding: 0 }}>
                {step === PetFriendNFTStep.SetFriendNFT ? (
                    <PetSetDialog onClose={handleSetDialogClose} configNFTs={configNFTs} />
                ) : (
                    <PetShareDialog onClose={handleClose} />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
