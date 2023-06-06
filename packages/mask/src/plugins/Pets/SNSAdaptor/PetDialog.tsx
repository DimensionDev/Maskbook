import { memo, useState } from 'react'
import { useAsync, useTimeout } from 'react-use'
import type { Constant } from '@masknet/web3-shared-base'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { Web3Storage } from '@masknet/web3-providers'
import { usePetConstants } from '@masknet/web3-shared-evm'
import { PetShareDialog } from './PetShareDialog.js'
import { PetSetDialog } from './PetSetDialog.js'
import { useI18N } from '../locales/index.js'
import type { ConfigRSSNode } from '../types.js'

enum PetFriendNFTStep {
    SetFriendNFT = 'set',
    ShareFriendNFT = 'share',
}

interface Props {
    open: boolean
    onClose(): void
}
export const PetDialog = memo(function PetDialog({ open, onClose }: Props) {
    const t = useI18N()
    const [step, setStep] = useState(PetFriendNFTStep.SetFriendNFT)
    const [configNFTs, setConfigNFTs] = useState<Record<string, Constant> | undefined>(undefined)
    const [isReady, cancel] = useTimeout(500)
    const { NFTS_BLOCK_ADDRESS = '' } = usePetConstants()
    useAsync(async () => {
        const storage = Web3Storage.createFireflyStorage('Pets', NFTS_BLOCK_ADDRESS)
        const result = await storage.get<ConfigRSSNode>('_pet_nfts')
        setConfigNFTs(result.essay)
    }, [Storage, NFTS_BLOCK_ADDRESS])

    const handleSetDialogClose = () => setStep(PetFriendNFTStep.ShareFriendNFT)

    const handleClose = () => {
        onClose()
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
})
