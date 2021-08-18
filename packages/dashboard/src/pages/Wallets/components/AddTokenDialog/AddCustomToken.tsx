import { memo, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import { AddTokenFormUI } from '../AddTokenFormUI'
import { AddTokenConfirmUI } from '../AddTokenConfirmUI'
import { useDashboardI18N } from '../../../../locales'
import { z as zod } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSnackbarCallback } from '@masknet/shared'
import { PluginServices } from '../../../../API'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { isSameAddress, useERC20TokenBalance, useERC20TokenDetailed, useWallet } from '@masknet/web3-shared'

enum AddTokenStep {
    INFORMATION = 0,
    CONFIRM = 1,
}

interface AddCustomTokenUIProps {
    onClose: () => void
    token?: ERC20TokenDetailed
    balance?: string
    onSubmit: () => void
}

export const AddCustomToken = memo(({ onClose }: { onClose: () => void }) => {
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
            decimals: zod
                .number()
                .int()
                .positive(t.wallets_token_decimals_tips())
                .max(18, t.wallets_token_decimals_tips()),
        })
    }, [t, wallet])

    const methods = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            address: '',
            symbol: '',
            decimals: 8,
        },
    })

    const {
        watch,
        formState: { errors, dirtyFields },
        setValue,
        handleSubmit,
    } = methods

    const address = watch('address')
    const { value: token } = useERC20TokenDetailed(!errors.address ? address : '')
    const { value: balance } = useERC20TokenBalance(!errors.address ? address : '')

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
        if (token && token.symbol !== 'UNKNOWN' && dirtyFields.address) {
            setValue('symbol', token.symbol ?? '', { shouldValidate: true })
            setValue('decimals', token.decimals, { shouldValidate: true })
        } else {
            setValue('symbol', '')
            setValue('decimals', 8)
        }
    }, [token, dirtyFields.address])

    return (
        <FormProvider {...methods}>
            <AddCustomTokenUI onClose={onClose} token={token} balance={balance} onSubmit={onSubmit} />
        </FormProvider>
    )
})

const AddCustomTokenUI = memo<AddCustomTokenUIProps>(({ onClose, token, balance, onSubmit }) => {
    const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)
    const { reset } = useFormContext()

    useUpdateEffect(() => {
        setStep(AddTokenStep.INFORMATION)
        reset()
    }, [])

    return (
        <>
            {step === AddTokenStep.INFORMATION ? (
                <AddTokenFormUI token={token} onClose={onClose} onNext={() => setStep(AddTokenStep.CONFIRM)} />
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
        </>
    )
})
