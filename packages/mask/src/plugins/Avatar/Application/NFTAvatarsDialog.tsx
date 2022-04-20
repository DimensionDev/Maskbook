import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { InjectedDialog } from '@masknet/shared'
import { UploadAvatarDialog } from './UploadAvatarDialog'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { PersonaPage } from './PersonaPage'
import { DialogContent } from '@mui/material'
import { useI18N } from '../locales/i18n_generated'
import { isSameAddress } from '@masknet/web3-shared-evm'

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
    const [proof, setProof] = useState<BindingProof>()
    const t = useI18N()

    const onPersonaChange = (proof: BindingProof, wallets?: BindingProof[], tokenInfo?: TokenInfo) => {
        setWallets(wallets)
        setTokenInfo(tokenInfo)
        setProof(proof)
    }

    const onSelected = (info: SelectTokenInfo) => {
        setSelectedTokenInfo(info)
    }

    const onNext = useCallback(() => {
        if (step === CreateNFTAvatarStep.Persona) setStep(CreateNFTAvatarStep.NFTList)
        else if (step === CreateNFTAvatarStep.NFTList) setStep(CreateNFTAvatarStep.UploadAvatar)
    }, [step])

    const onBack = useCallback(() => {
        if (step === CreateNFTAvatarStep.UploadAvatar) setStep(CreateNFTAvatarStep.NFTList)
        else if (step === CreateNFTAvatarStep.NFTList) setStep(CreateNFTAvatarStep.Persona)
        else props.onClose()
    }, [step])

    const onClose = useCallback(() => {
        setStep(CreateNFTAvatarStep.Persona)
        props.onClose()
    }, [props.onClose])

    return (
        <InjectedDialog
            title={
                step === CreateNFTAvatarStep.UploadAvatar
                    ? t.application_edit_profile_dialog_title()
                    : t.application_dialog_title()
            }
            open={props.open}
            onClose={onBack}>
            <DialogContent sx={{ margin: 0, padding: '0px !important' }}>
                {step === CreateNFTAvatarStep.Persona ? (
                    <PersonaPage onClose={onClose} onNext={onNext} onChange={onPersonaChange} />
                ) : null}
                {step === CreateNFTAvatarStep.NFTList ? (
                    <NFTListDialog tokenInfo={tokenInfo} wallets={wallets} onNext={onNext} onSelected={onSelected} />
                ) : null}
                {step === CreateNFTAvatarStep.UploadAvatar ? (
                    <UploadAvatarDialog
                        proof={proof}
                        isBindAccount={wallets?.some((x) => isSameAddress(x.identity, selectedTokenInfo?.account))}
                        account={selectedTokenInfo?.account}
                        image={selectedTokenInfo?.image}
                        token={selectedTokenInfo?.token}
                        onBack={onBack}
                        onClose={onClose}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
