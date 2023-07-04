import { ActionButton, makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { z as zod } from 'zod'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm.js'

const useStyles = makeStyles()({
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
})

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

    const onCreate = useCallback(async ({ name }: zod.infer<typeof schema>) => {
        try {
            await WalletRPC.deriveWallet(name)
            navigate(-1)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(errorMessage)
            }
        }
    }, [])

    const onSubmit = handleSubmit(onCreate)

    useTitle(t('popups_add_wallet'))

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
            </Box>
            <ActionButton fullWidth disabled={!isValid} onClick={onSubmit}>
                {t('add')}
            </ActionButton>
        </div>
    )
})

export default CreateWallet
