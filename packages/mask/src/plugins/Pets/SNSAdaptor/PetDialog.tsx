import { useState } from 'react'
import { useAsync, useTimeout } from 'react-use'
import type { Constant } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { PluginPetMessages } from '../messages.js'
import { useI18N } from '../locales/index.js'
import { PetShareDialog } from './PetShareDialog.js'
import { PetSetDialog } from './PetSetDialog.js'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { usePetConstants } from '@masknet/web3-shared-evm'
import type { ConfigRSSNode } from '../types.js'

enum PetFriendNFTStep {
    SetFriendNFT = 'set',
    ShareFriendNFT = 'share',
}

export function PetDialog() {
    const t = useI18N()
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated, () => {})
    const [step, setStep] = useState(PetFriendNFTStep.SetFriendNFT)
    const [configNFTs, setConfigNFTs] = useState<Record<string, Constant> | undefined>(undefined)
    const [isReady, cancel] = useTimeout(500)
    const { NFTS_BLOCK_ADDRESS = '' } = usePetConstants()
    useAsync(async () => {
        if (!Storage) return
        const storage = Storage.createRSS3Storage(NFTS_BLOCK_ADDRESS)
        const data = await storage.get<ConfigRSSNode>('_pet_nfts')
        setConfigNFTs(data?.essay)
    }, [Storage, NFTS_BLOCK_ADDRESS])

    const handleSetDialogClose = () => setStep(PetFriendNFTStep.ShareFriendNFT)

    const handleClose = () => {
        closeDialog()
        isReady() ? setStep(PetFriendNFTStep.SetFriendNFT) : cancel()
    }

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={step === PetFriendNFTStep.SetFriendNFT ? t.pets_dialog_title() : t.pets_dialog_title_share()}
            titleBarIconStyle="back">
            <DialogContent style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                {step === PetFriendNFTStep.SetFriendNFT ? (
                    <PetSetDialog onClose={handleSetDialogClose} configNFTs={configNFTs} />
                ) : (
                    <PetShareDialog onClose={handleClose} />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
