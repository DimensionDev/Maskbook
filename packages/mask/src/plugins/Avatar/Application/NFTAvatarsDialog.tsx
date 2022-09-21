import { useCallback, useEffect, useState } from 'react'
import { NFTListDialog } from './NFTListDialog.js'
import { InjectedDialog } from '@masknet/shared'
import { UploadAvatarDialog } from './UploadAvatarDialog.js'
import { BindingProof, CrossIsolationMessages } from '@masknet/shared-base'
import { useAccount } from '@masknet/plugin-infra/web3'
import { AllChainsNonFungibleToken, PFP_TYPE, SelectTokenInfo } from '../types.js'
import { PersonaPage } from './PersonaPage.js'
import { DialogContent } from '@mui/material'
import { useI18N } from '../locales/i18n_generated'
import { isSameAddress } from '@masknet/web3-shared-base'
import { makeStyles, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { PluginID } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: 0,
        padding: '0px !important',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))
enum CreateNFTAvatarStep {
    Persona = 'persona',
    NFTList = 'NFTList',
    UploadAvatar = 'UploadAvatar',
}

export function NFTAvatarDialog() {
    const [open, setOpen] = useState(false)
    const account = useAccount()
    const [step, setStep] = useState(CreateNFTAvatarStep.Persona)
    const [wallets, setWallets] = useState<BindingProof[]>()

    const [selectedAccount, setSelectedAccount] = useState((account || wallets?.[0]?.identity) ?? '')
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()
    const [tokenInfo, setTokenInfo] = useState<AllChainsNonFungibleToken>()
    const [proof, setProof] = useState<BindingProof>()
    const t = useI18N()
    const { classes } = useStyles()

    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, application }) => {
            if (application !== PluginID.Avatar) return
            setOpen(open)
        })
    }, [])

    const handleClose = () => setOpen(false)

    const onPersonaChange = (proof: BindingProof, wallets?: BindingProof[], tokenInfo?: AllChainsNonFungibleToken) => {
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
        else handleClose()
    }, [step])

    const onClose = useCallback(() => {
        setStep(CreateNFTAvatarStep.Persona)
        handleClose()
    }, [handleClose])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets?.[0]?.identity])

    /** hidden background page **/
    const [currentTab, onChange, tabs] = useTabs(PFP_TYPE.PFP /* , PFP_TYPE.BACKGROUND */)
    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                title={
                    step === CreateNFTAvatarStep.UploadAvatar
                        ? t.application_edit_profile_dialog_title()
                        : t.application_dialog_title()
                }
                isOnBack={step !== CreateNFTAvatarStep.Persona}
                open={open}
                onClose={onBack}>
                <DialogContent className={classes.root}>
                    {step === CreateNFTAvatarStep.Persona ? (
                        <PersonaPage onClose={onClose} onNext={onNext} onChange={onPersonaChange} />
                    ) : null}
                    {step === CreateNFTAvatarStep.NFTList ? (
                        <NFTListDialog
                            tokenInfo={tokenInfo}
                            wallets={wallets}
                            onNext={onNext}
                            onSelected={onSelected}
                            pfpType={currentTab}
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                        />
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
        </TabContext>
    )
}
