import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { InjectedDialog } from '@masknet/shared'
import { UploadAvatarDialog } from './UploadAvatarDialog'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo } from '../types'
import { PersonaPage } from './PersonaPage'
import { DialogContent } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

enum CreateNFTAvatarStep {
    Persona = 'persona',
    NFTList = 'NFTList',
    UploadAvatar = 'UploadAvatar',
}

interface NFTAvatarsDialogProps extends withClasses<never> {
    open: boolean
    onClose: () => void
}

export function NFTAvatarDialog(props: NFTAvatarsDialogProps) {
    const { classes } = useStyles()
    const [step, setStep] = useState(CreateNFTAvatarStep.Persona)
    const [wallets, setWallets] = useState<BindingProof[]>()
    const [selctedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()

    const onPersonaChange = (wallets?: BindingProof[]) => {
        setWallets(wallets)
    }

    const onSelected = (info: SelectTokenInfo) => {
        setSelectedTokenInfo(info)
    }

    const onNext = useCallback(() => {
        if (step === CreateNFTAvatarStep.Persona) setStep(CreateNFTAvatarStep.NFTList)
        else if (step === CreateNFTAvatarStep.NFTList) setStep(CreateNFTAvatarStep.UploadAvatar)
    }, [step])

    const onClose = useCallback(() => {
        if (step === CreateNFTAvatarStep.UploadAvatar) setStep(CreateNFTAvatarStep.NFTList)
        else if (step === CreateNFTAvatarStep.NFTList) setStep(CreateNFTAvatarStep.Persona)
        else props.onClose()
    }, [step])

    return (
        <InjectedDialog title="NFT PFP" open={props.open} onClose={onClose}>
            <DialogContent sx={{ margin: 0, padding: '0px !important' }}>
                {step === CreateNFTAvatarStep.Persona ? (
                    <PersonaPage onNext={onNext} onChange={onPersonaChange} />
                ) : null}
                {step === CreateNFTAvatarStep.NFTList ? (
                    <NFTListDialog wallets={wallets} onNext={onNext} onSelected={onSelected} />
                ) : null}
                {step === CreateNFTAvatarStep.UploadAvatar ? (
                    <UploadAvatarDialog
                        account={selctedTokenInfo?.account}
                        image={selctedTokenInfo?.image}
                        token={selctedTokenInfo?.token}
                        onClose={() => {
                            setStep(CreateNFTAvatarStep.Persona)
                            props.onClose()
                        }}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
