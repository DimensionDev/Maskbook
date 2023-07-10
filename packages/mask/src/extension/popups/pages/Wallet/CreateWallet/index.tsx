import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { z as zod } from 'zod'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm.js'
import { Web3 } from '@masknet/web3-providers'
import { PopupRoutes } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    error: {
        color: theme.palette.maskColor.danger,
        marginTop: theme.spacing(0.5),
    },
}))

const CreateWallet = memo(function CreateWallet() {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const [errorMessage, setErrorMessage] = useState('')

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        schema,
    } = useSetWalletNameForm()

    const [{ loading }, onCreate] = useAsyncFn(async ({ name }: zod.infer<typeof schema>) => {
        try {
            const address = await WalletRPC.deriveWallet(name)
            await Web3.connect({
                account: address,
            })
            navigate(PopupRoutes.Wallet, { replace: true })
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(errorMessage)
            }
        }
    }, [])

    const onSubmit = handleSubmit(onCreate)

    useTitle(t('popups_add_wallet'))
    const disabled = !isValid || loading

    return (
        <div className={classes.content}>
            <Box flexGrow={1} overflow="auto">
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            placeholder={t('popups_wallet_enter_your_wallet_name')}
                            error={!!errorMessage || !!errors.name?.message}
                            helperText={errorMessage || errors.name?.message}
                        />
                    )}
                />
                {errors.name ? <Typography className={classes.error}>{errors.name.message}</Typography> : null}
            </Box>
            <ActionButton loading={loading} fullWidth disabled={disabled} onClick={onSubmit}>
                {t('add')}
            </ActionButton>
        </div>
    )
})

export default CreateWallet
