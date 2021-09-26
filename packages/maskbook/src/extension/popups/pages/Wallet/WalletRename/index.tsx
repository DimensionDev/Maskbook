import { memo, useMemo } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { StyledInput } from '../../../components/StyledInput'
import { useWallet } from '@masknet/web3-shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../../../utils'
import { useAsyncFn } from 'react-use'
import { LoadingButton } from '@material-ui/lab'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
        padding: '9px 0',
        borderRadius: 20,
    },
})

const WalletRename = memo(() => {
    const { t } = useI18N()
    const history = useHistory()
    const { classes } = useStyles()
    const wallet = useWallet()

    const schema = useMemo(() => {
        return zod.object({
            name: zod.string().min(1).max(12),
        })
    }, [])

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: wallet?.name,
        },
    })

    const [{ loading }, renameWallet] = useAsyncFn(
        async ({ name }: zod.infer<typeof schema>) => {
            if (!wallet?.address || !name) return
            await WalletRPC.renameWallet(wallet.address, name)
            return history.goBack()
        },
        [wallet?.address],
    )

    const onSubmit = handleSubmit(renameWallet)

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('rename')}</Typography>
            </div>
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
                    className={classes.button}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default WalletRename
