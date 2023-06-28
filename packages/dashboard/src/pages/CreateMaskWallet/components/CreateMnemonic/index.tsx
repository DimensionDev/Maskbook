import { memo, useCallback, useEffect, useState } from 'react'
import { useAsyncFn, useAsyncRetry, useCopyToClipboard } from 'react-use'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, alpha, Typography, useTheme } from '@mui/material'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { useDashboardI18N } from '../../../../locales/index.js'
import { MnemonicReveal } from '../../../../components/Mnemonic/index.js'
import { VerifyMnemonicDialog } from '../VerifyMnemonicDialog/index.js'
import { PluginServices } from '../../../../API.js'
import { useMnemonicWordsPuzzle } from '../../../../hooks/useMnemonicWordsPuzzle.js'
import { HeaderLine } from '../../../../components/HeaderLine/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
    },
    container: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingLeft: 200,
    },
    title: {
        fontSize: 30,
        margin: '12px 0',
        lineHeight: '120%',
        color: theme.palette.maskColor.main,
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        fontFamily: 'Helvetica',
        color: theme.palette.maskColor.second,
    },
    refresh: {
        display: 'flex',
        width: 88,
        marginTop: 24,
        padding: '8px 12px',
        float: 'right',
        cursor: 'pointer',
        fontSize: 12,
        color: theme.palette.maskColor.main,
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
    },
    words: {
        marginTop: 12,
        width: '100%',
    },
    button: {
        marginTop: 36,
        padding: '14px 20px',
        borderRadius: 10,
        width: 126,
        whiteSpace: 'nowrap',
        fontSize: 16,
        lineHeight: '20px',
        color: theme.palette.maskColor.bottom,
        background: theme.palette.maskColor.main,
        '&:hover': {
            boxShadow: `0 0 5px ${theme.palette.maskColor.main}`,
            color: theme.palette.maskColor.bottom,
            background: theme.palette.maskColor.main,
        },
    },
    maskBanner: {
        marginBottom: 36,
    },
    leftSide: {
        width: '90%',
        maxWidth: 948,
        marginBottom: 160,
    },
    rightSide: {
        width: 457,
        height: '100vh',
        background: theme.palette.maskColor.primary,
    },
    import: {
        fontSize: 14,
        cursor: 'pointer',
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    helveticaBold: {
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    alert: {
        marginTop: 24,
        padding: 12,
        color: theme.palette.maskColor.warn,
        background: alpha(theme.palette.maskColor.warn, 0.1),
        backdropFilter: 'blur(5px)',
    },
    storeWords: {
        display: 'flex',
        alignItems: 'flex-start',
        marginTop: 12,
        gap: '12px',
    },
    storeIcon: {
        height: 40,
        width: 40,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.maskColor.line}`,
    },
    between: {
        display: 'flex',
        justifyContent: 'space-between',
    },
}))

const CreateMnemonic = memo(() => {
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const { words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback } = useMnemonicWordsPuzzle()
    const [searchParams] = useSearchParams()
    const { value: hasPassword, loading, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    useEffect(() => {
        WalletMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    const onVerifyClick = useCallback(() => {
        setOpen(true)
    }, [])

    const [walletState, onSubmit] = useAsyncFn(async () => {
        const name = new URLSearchParams(location.search).get('name')
        const password = location.state?.password
        // if the name doesn't exist, navigate to form page
        if (!name) {
            resetCallback()
            navigate(DashboardRoutes.CreateMaskWalletForm)
            return
        }

        if (!hasPassword) {
            await PluginServices.Wallet.setPassword(password)
        }

        const address = await PluginServices.Wallet.recoverWalletFromMnemonic(
            name,
            words.join(' '),
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
        )

        await PluginServices.Wallet.resolveMaskAccount([
            {
                address,
            },
        ])

        return address
    }, [location.search, words, resetCallback, hasPassword, searchParams])

    const onClose = useCallback(() => {
        refreshCallback()
        resetCallback()
        setOpen(false)
    }, [refreshCallback, resetCallback])

    useEffect(() => {
        if (!location.state?.password && !hasPassword && !loading) navigate(-1)
    }, [location.state, hasPassword, loading])

    return (
        <>
            <CreateMnemonicUI words={words} onRefreshWords={refreshCallback} onVerifyClick={onVerifyClick} />
            <VerifyMnemonicDialog
                matched={words.join(' ') === puzzleWords.join(' ')}
                onUpdateAnswerWords={answerCallback}
                indexes={indexes}
                puzzleWords={puzzleWords}
                open={open}
                onClose={onClose}
                onSubmit={onSubmit}
                loading={walletState.loading}
                address={walletState.value}
            />
        </>
    )
})

export interface CreateMnemonicUIProps {
    words: string[]
    onRefreshWords: () => void
    onVerifyClick: () => void
}

export const CreateMnemonicUI = memo<CreateMnemonicUIProps>(({ words, onRefreshWords, onVerifyClick }) => {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const theme = useTheme()
    const [copyState, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    useEffect(() => {
        if (copyState.value) {
            showSnackbar(t.personas_export_persona_copy_success(), {
                variant: 'success',
                message: t.persona_phrase_copy_description(),
            })
        }
        if (copyState.error?.message) {
            showSnackbar(t.personas_export_persona_copy_failed(), { variant: 'error' })
        }
    }, [copyState.value, copyState.error?.message])

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <div className={classes.leftSide}>
                    <HeaderLine width={166} height={48} className={classes.maskBanner} />
                    <div className={classes.between}>
                        <Typography className={cx(classes.second, classes.helveticaBold)}>
                            {t.create_step({ step: '2', total: '3' })}
                        </Typography>
                        <Typography className={cx(classes.import, classes.helveticaBold)}>
                            {t.wallets_import_wallet_import()}
                        </Typography>
                    </div>

                    <Typography className={cx(classes.title, classes.helveticaBold)}>
                        {t.write_down_recovery_phrase()}
                    </Typography>
                    <Typography className={classes.tips}>{t.store_recovery_phrase_tip()}</Typography>
                    <div className={cx(classes.helveticaBold, classes.refresh)} onClick={onRefreshWords}>
                        <Icons.Refresh color={theme.palette.maskColor.main} size={16} />
                        <Typography className={classes.helveticaBold} fontSize={12}>
                            {t.wallets_create_wallet_refresh()}
                        </Typography>
                    </div>
                    <div className={classes.words}>
                        <MnemonicReveal words={words} indexed />
                    </div>
                    <div className={classes.storeWords}>
                        <div className={classes.storeIcon}>
                            <Icons.Download2 color={theme.palette.maskColor.main} size={18} />
                        </div>
                        <div className={classes.storeIcon} onClick={() => copyToClipboard(words.join(' '))}>
                            <Icons.Copy color={theme.palette.maskColor.main} size={18} />
                        </div>
                    </div>
                    <Alert icon={<Icons.WarningTriangle />} severity="warning" className={classes.alert}>
                        {t.create_wallet_mnemonic_tip()}
                    </Alert>
                </div>
                <ActionButton className={cx(classes.button, classes.helveticaBold)} onClick={onVerifyClick}>
                    {t.create_wallet_mnemonic_keep_safe()}
                </ActionButton>
            </div>
            <div className={classes.rightSide} />
        </div>
    )
})

export default CreateMnemonic
