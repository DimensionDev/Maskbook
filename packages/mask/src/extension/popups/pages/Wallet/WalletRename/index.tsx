import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { StyledInput } from '../../../components/StyledInput'
import { useWallet } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useNavigate } from 'react-router-dom'
import { useI18N } from '../../../../../utils'
import { useAsyncFn } from 'react-use'
import { LoadingButton } from '@mui/lab'
import type { z as zod } from 'zod'
import { Controller } from 'react-hook-form'
import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm'
import { WalletContext } from '../hooks/useWalletContext'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()({
    header: {
        padding: '10px 16px',
        backgroundColor: '#EFF5FF',
        color: '#1C68F3',
    },
    title: {
        fontSize: 14,
        lineHeight: '20px',
    },
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

const WalletRename = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { selectedWallet } = WalletContext.useContainer()
    const currentWallet = useWallet()
    const wallet = selectedWallet ?? currentWallet

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        schema,
    } = useSetWalletNameForm(wallet?.name)

    const [{ loading }, renameWallet] = useAsyncFn(
        async ({ name }: zod.infer<typeof schema>) => {
            if (!wallet?.address || !name) return
            await WalletRPC.renameWallet(wallet.address, name)
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
