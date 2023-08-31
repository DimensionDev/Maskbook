import { defer, timeout } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Providers, Web3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { memo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import type { z as zod } from 'zod'
import Services from '../../../../service.js'
import { useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useTitle } from '../../../hooks/index.js'
import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm.js'
import { useWeb3State } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
}))

async function pollResult(address: string) {
    const subscription = Providers[ProviderType.MaskWallet].subscription.wallets
    if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) return
    const [promise, resolve] = defer()
    const unsubscribe = subscription.subscribe(() => {
        if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) resolve(true)
    })
    return timeout(promise, 10_000, 'It takes too long to create a wallet. You might try again.').finally(unsubscribe)
}

const CreateWallet = memo(function CreateWallet() {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const [errorMessage, setErrorMessage] = useState('')

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isValid },
        schema,
    } = useSetWalletNameForm()

    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { loading: isLoadingEns } = useAsync(async () => {
        if (!NameService?.reverse) return
        const nextWallet = await Services.Wallet.generateNextDerivationAddress()
        if (!nextWallet) return
        const ens = await NameService.reverse(nextWallet)
        if (ens) setValue('name', ens)
    }, [!NameService?.reverse, setValue])

    const [{ loading }, onCreate] = useAsyncFn(async ({ name }: zod.infer<typeof schema>) => {
        try {
            const address = await Services.Wallet.deriveWallet(name)
            await pollResult(address)
            await Web3.connect({
                account: address,
                providerType: ProviderType.MaskWallet,
            })
            navigate(-1)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(errorMessage)
            }
        }
    }, [])

    const onSubmit = handleSubmit(onCreate)

    useTitle(t('popups_add_wallet'))
    const disabled = !isValid || loading || isLoadingEns

    return (
        <div className={classes.content}>
            <Box flexGrow={1} overflow="auto">
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            autoFocus
                            disabled={isLoadingEns}
                            placeholder={t('popups_wallet_enter_your_wallet_name')}
                            error={!!errorMessage || !!errors.name?.message}
                            helperText={errorMessage || errors.name?.message}
                            inputProps={{
                                maxLength: 18,
                            }}
                        />
                    )}
                />
            </Box>
            <ActionButton loading={loading || isLoadingEns} fullWidth disabled={disabled} onClick={onSubmit}>
                {t('add')}
            </ActionButton>
        </div>
    )
})

export default CreateWallet
