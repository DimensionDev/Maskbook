import { makeStyles } from '@masknet/theme'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'
import { memo } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import type { z as zod } from 'zod'
import { useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useTitle } from '../../../hooks/index.js'
import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm.js'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

/**
 * @deprecated unused
 */
const WalletRename = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const currentWallet = useWallet()
    const wallets = useWallets()
    const [params] = useSearchParams()
    const paramWallet = wallets.find((x) => isSameAddress(x.address, params.get('wallet') || ''))
    const wallet = paramWallet ?? currentWallet

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        schema,
    } = useSetWalletNameForm(wallet?.name)

    const [{ loading }, renameWallet] = useAsyncFn(
        async ({ name }: zod.infer<typeof schema>) => {
            if (!wallet?.address || !name) return
            await Web3.renameWallet?.(wallet.address, name, {
                providerType: ProviderType.MaskWallet,
            })
            return navigate(-1)
        },
        [wallet?.address],
    )

    const onSubmit = handleSubmit(renameWallet)

    useTitle(t('popups_rename'))

    return (
        <>
            <div className={classes.content}>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            error={!!errors.name?.message}
                            helperText={errors.name?.message}
                            defaultValue={wallet?.name}
                        />
                    )}
                />
                <LoadingButton
                    fullWidth
                    loading={loading}
                    variant="contained"
                    disabled={!isValid}
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default WalletRename
