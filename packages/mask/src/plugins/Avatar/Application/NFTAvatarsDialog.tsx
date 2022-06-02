import { useCallback, useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { InjectedDialog } from '@masknet/shared'
import { UploadAvatarDialog } from './UploadAvatarDialog'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { PersonaPage } from './PersonaPage'
import { DialogContent } from '@mui/material'
import { useI18N } from '../locales/i18n_generated'
import { isSameAddress } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: 0,
        padding: '1px !important',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
}))
enum CreateNFTAvatarStep {
    Persona = 'persona',
    NFTList = 'NFTList',
    UploadAvatar = 'UploadAvatar',
}

interface NFTAvatarsDialogProps {
    open: boolean
    onClose: () => void
}

export function NFTAvatarDialog(props: NFTAvatarsDialogProps) {
    const [step, setStep] = useState(CreateNFTAvatarStep.Persona)
    const [wallets, setWallets] = useState<BindingProof[]>()
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>()
    const [proof, setProof] = useState<BindingProof>()
    const t = useI18N()
    const { classes } = useStyles()

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
            <DialogContent className={classes.root}>
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
                        pluginId={selectedTokenInfo?.pluginId}
                        onBack={onBack}
                        onClose={onClose}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
