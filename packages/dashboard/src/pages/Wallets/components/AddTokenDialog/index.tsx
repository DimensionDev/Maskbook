import { memo, useEffect, useMemo, useState } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import {
    ERC20TokenDetailed,
    isSameAddress,
    useERC20TokenBalance,
    useERC20TokenDetailed,
    useWallet,
} from '@masknet/web3-shared'
import { useUpdateEffect } from 'react-use'
import { PluginServices } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'
import { AddTokenFormUI } from '../AddTokenFormUI'
import { AddTokenConfirmUI } from '../AddTokenConfirmUI'
import { z as zod } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

enum AddTokenStep {
    INFORMATION,
    CONFIRM,
}

export type AddTokenFormData = {
    address: string
    symbol: string
    decimals: number
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()

    const wallet = useWallet()

    const schema = useMemo(() => {
        return zod.object({
            address: zod
                .string()
                .refine((address) => EthereumAddress.isValid(address), t.wallets_incorrect_address())
                .refine(
                    (address) =>
                        !Array.from(wallet?.erc20_token_whitelist ?? []).find((item) => isSameAddress(item, address)),
                    t.wallets_token_been_added(),
                ),
            symbol: zod.string().min(1).max(11, t.wallets_token_symbol_tips()),
            decimals: zod.number().positive(t.wallets_token_decimals_tips()).max(18, t.wallets_token_decimals_tips()),
        })
    }, [t, wallet])

    const methods = useForm<AddTokenFormData>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            symbol: '',
            decimals: 0,
        },
    })

    const { watch, formState, setValue, handleSubmit, trigger } = methods

    const [address] = watch(['address'])

    const { value: token } = useERC20TokenDetailed(address)
    const { value: balance } = useERC20TokenBalance(address)

    const onSubmit = useSnackbarCallback({
        executor: handleSubmit(async (data) => {
            if (!token || !wallet) return
            await Promise.all([
                PluginServices.Wallet.addERC20Token({ ...token, ...data }),
                PluginServices.Wallet.trustERC20Token(wallet.address, { ...token, ...data }),
            ])
        }),
        deps: [token, wallet],
        onSuccess: onClose,
    })

    useEffect(() => {
        if (token && token.symbol !== 'UNKNOWN' && formState.dirtyFields.address) {
            setValue('symbol', token.symbol ?? '')
            setValue('decimals', token.decimals)
            // trigger form valid
            trigger()
        } else {
            setValue('symbol', '')
            setValue('decimals', 0)
        }
    }, [token, formState.dirtyFields.address])

    return (
        <FormProvider {...methods}>
            <AddTokenDialogUI open={open} onClose={onClose} token={token} balance={balance} onSubmit={onSubmit} />
        </FormProvider>
    )
})

export interface AddTokenDialogUIProps {
    open: boolean
    onClose: () => void
    token?: ERC20TokenDetailed
    balance?: string
    onSubmit: () => void
}

export const AddTokenDialogUI = memo<AddTokenDialogUIProps>(({ open, onClose, token, balance, onSubmit }) => {
    const t = useDashboardI18N()
    const { reset, watch } = useFormContext()
    const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)

    const [symbol] = watch(['symbol'])

    //#region When dialog be closed, reset step and clear address input
    useUpdateEffect(() => {
        if (!open) {
            setStep(AddTokenStep.INFORMATION)
            reset()
        }
    }, [open])

    return (
        <MaskDialog maxWidth="md" open={open} title={t.wallets_add_token()} onClose={onClose}>
            {step === AddTokenStep.INFORMATION ? (
                <AddTokenFormUI token={token} onClose={onClose} onNext={() => setStep(AddTokenStep.CONFIRM)} />
            ) : null}
            {step === AddTokenStep.CONFIRM ? (
                <>
                    <AddTokenConfirmUI
                        token={token}
                        aliasSymbol={symbol}
                        balance={balance}
                        onBack={() => setStep(AddTokenStep.INFORMATION)}
                        onConfirm={onSubmit}
                    />
                </>
            ) : null}
        </MaskDialog>
    )
})
