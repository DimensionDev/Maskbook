import { memo, useState } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { ERC20TokenDetailed, useERC20TokenBalance, useERC20TokenDetailed, useWallet } from '@masknet/web3-shared'
import { useUpdateEffect } from 'react-use'
import { PluginServices } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'
import { AddTokenFormUI } from '../AddTokenFormUI'
import { AddTokenConfirmUI } from '../AddTokenConfirmUI'

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

enum AddTokenStep {
    INFORMATION,
    CONFIRM,
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const [address, setAddress] = useState('')

    const wallet = useWallet()
    const { value: token } = useERC20TokenDetailed(address)
    const { value: balance } = useERC20TokenBalance(address)

    const onSubmit = useSnackbarCallback({
        executor: async () => {
            if (!token || !wallet) return
            await Promise.all([
                PluginServices.Wallet.addERC20Token(token),
                PluginServices.Wallet.trustERC20Token(wallet.address, token),
            ])
        },
        deps: [token, wallet],
        onSuccess: onClose,
    })

    return (
        <AddTokenDialogUI
            address={address}
            onAddressChange={setAddress}
            open={open}
            onClose={onClose}
            token={token}
            exclude={Array.from(wallet?.erc20_token_whitelist ?? [])}
            balance={balance}
            onSubmit={onSubmit}
        />
    )
})

export interface AddTokenDialogUIProps {
    address: string
    onAddressChange: (address: string) => void
    open: boolean
    onClose: () => void
    token?: ERC20TokenDetailed
    exclude: string[]
    balance?: string
    onSubmit: () => void
}

export const AddTokenDialogUI = memo<AddTokenDialogUIProps>(
    ({ address, onAddressChange, open, onClose, token, exclude, balance, onSubmit }) => {
        const t = useDashboardI18N()
        const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)

        //#region When dialog be closed, reset step and clear address input
        useUpdateEffect(() => {
            if (!open) {
                setStep(AddTokenStep.INFORMATION)
                onAddressChange('')
            }
        }, [open])

        return (
            <MaskDialog maxWidth="md" open={open} title={t.wallets_add_token()} onClose={onClose}>
                {step === AddTokenStep.INFORMATION ? (
                    <AddTokenFormUI
                        address={address}
                        onAddressChange={onAddressChange}
                        token={token}
                        open={open}
                        exclude={exclude}
                        onClose={onClose}
                        onNext={() => setStep(AddTokenStep.CONFIRM)}
                    />
                ) : null}
                {step === AddTokenStep.CONFIRM ? (
                    <>
                        <AddTokenConfirmUI
                            token={token}
                            balance={balance}
                            onBack={() => setStep(AddTokenStep.INFORMATION)}
                            onConfirm={onSubmit}
                        />
                    </>
                ) : null}
            </MaskDialog>
        )
    },
)
