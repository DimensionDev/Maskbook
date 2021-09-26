import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Controller } from 'react-hook-form'
import type { z as zod } from 'zod'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { StyledInput } from '../../../components/StyledInput'
import { useHistory } from 'react-router-dom'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'

import { useSetWalletNameForm } from '../hooks/useSetWalletNameForm'

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
        padding: '9px 0',
        borderRadius: 20,
    },
})

const CreateWallet = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
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
            history.goBack()
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(errorMessage)
            }
        }
    }, [])

    const onSubmit = handleSubmit(onCreate)

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('wallet_new')}</Typography>
                <NetworkSelector />
            </div>
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
