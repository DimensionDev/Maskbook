import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { InjectedDialog } from '@masknet/shared'
import { UploadAvatarDialog } from './UploadAvatarDialog'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
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
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>()

    const onPersonaChange = (wallets?: BindingProof[], tokenInfo?: TokenInfo) => {
        setWallets(wallets)
        setTokenInfo(tokenInfo)
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
                    <NFTListDialog tokenInfo={tokenInfo} wallets={wallets} onNext={onNext} onSelected={onSelected} />
                ) : null}
                {step === CreateNFTAvatarStep.UploadAvatar ? (
                    <UploadAvatarDialog
                        account={selectedTokenInfo?.account}
                        image={selectedTokenInfo?.image}
                        token={selectedTokenInfo?.token}
                        onBack={onClose}
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
