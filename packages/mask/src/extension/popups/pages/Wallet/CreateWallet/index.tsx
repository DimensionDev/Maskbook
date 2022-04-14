import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Controller } from 'react-hook-form'
import type { z as zod } from 'zod'
import { StyledInput } from '../../../components/StyledInput'
import { useNavigate } from 'react-router-dom'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'

import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 10px',
    },
    title: {
        color: '#15181B',
        fontSize: 12,
        fontHeight: '16px',
    },
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
    },
})

const CreateWallet = memo(() => {
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

    useTitle(t('popups_create_wallet'))

    return (
        <>
            <div className={classes.content}>
                <div>
                    <Typography className={classes.label}>{t('wallet_name')}</Typography>
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
                </div>
                <Button variant="contained" className={classes.button} disabled={!isValid} onClick={onSubmit}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    )
})

export default CreateWallet
