import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useAsync, useAsyncFn, useAsyncRetry, useCopyToClipboard } from 'react-use'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, alpha, Box, Button, Stack, Typography, useTheme } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, DashboardRoutes } from '@masknet/shared-base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { useDashboardI18N } from '../../../../locales/index.js'
import { MnemonicReveal } from '../../../../components/Mnemonic/index.js'
import { PluginServices } from '../../../../API.js'
import { useMnemonicWordsPuzzle } from '../../../../hooks/useMnemonicWordsPuzzle.js'
import { HeaderLine } from '../../../../components/HeaderLine/index.js'
import { ComponentToPrint } from './ComponentToPrint.js'
import { toBlob } from 'html-to-image'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../../components/SecondaryButton/index.js'

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
    cancelButton: {},
    maskBanner: {
        marginBottom: 36,
    },
    leftSide: {
        width: '90%',
        maxWidth: 948,
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
        marginBottom: 160,
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
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
    between: {
        display: 'flex',
        justifyContent: 'space-between',
    },
}))

const CreateMnemonic = memo(() => {
    const location = useLocation()
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()
    const [isVerify, setIsVerify] = useState(true)
    const { words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback } = useMnemonicWordsPuzzle()
    const [searchParams] = useSearchParams()
    const { value: hasPassword, loading, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    useEffect(() => {
        CrossIsolationMessages.events.walletLockStatusUpdated.on(retry)
    }, [retry])

    const onVerifyClick = useCallback(() => {
        setIsVerify(true)
    }, [])

    const onBackClick = useCallback(() => {
        setIsVerify(false)
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
        setIsVerify(false)
    }, [refreshCallback, resetCallback])

    useEffect(() => {
        if (!location.state?.password && !hasPassword && !loading) navigate(-1)
    }, [location.state, hasPassword, loading])

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <div className={classes.leftSide}>
                    <HeaderLine width={166} height={48} className={classes.maskBanner} />
                    <div className={classes.between}>
                        <Typography className={cx(classes.second, classes.helveticaBold)}>
                            {t.create_step({ step: isVerify ? '3' : '2', total: '3' })}
                        </Typography>
                        <Typography className={cx(classes.import, classes.helveticaBold)}>
                            {t.wallets_import_wallet_import()}
                        </Typography>
                    </div>
                    {isVerify ? (
                        <VerifyMnemonicUI
                            setIsVerify={setIsVerify}
                            hasPassword={hasPassword}
                            words={words}
                            onSubmit={onSubmit}
                        />
                    ) : (
                        <CreateMnemonicUI
                            hasPassword={hasPassword}
                            words={words}
                            onRefreshWords={refreshCallback}
                            onVerifyClick={onVerifyClick}
                        />
                    )}
                </div>
            </div>
            {/* <VerifyMnemonicDialog
                matched={words.join(' ') === puzzleWords.join(' ')}
                onUpdateAnswerWords={answerCallback}
                indexes={indexes}
                puzzleWords={puzzleWords}
                open={isVerify}
                onClose={onClose}
                onSubmit={onSubmit}
                loading={walletState.loading}
                address={walletState.value}
            /> */}
            <div className={classes.rightSide} />
        </div>
    )
})

interface CreateMnemonicUIProps {
    words: string[]
    hasPassword?: boolean
    onRefreshWords: () => void
    onVerifyClick: () => void
}

interface VerifyMnemonicUIProps {
    words: string[]
    hasPassword?: boolean
    setIsVerify: (isVerify: boolean) => void
    onSubmit: () => void
}

const VerifyMnemonicUI = memo<VerifyMnemonicUIProps>(({ words, hasPassword, setIsVerify, onSubmit }) => {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()

    return (
        <>
            <Typography className={cx(classes.title, classes.helveticaBold)}>
                {t.wallets_create_wallet_verification()}
            </Typography>
            <Typography className={classes.tips}>{t.create_wallet_verify_words()}</Typography>

            <div className={classes.buttonGroup}>
                <SecondaryButton
                    className={classes.helveticaBold}
                    width="125px"
                    size="large"
                    onClick={() => setIsVerify(false)}>
                    {t.back()}
                </SecondaryButton>
                <PrimaryButton
                    className={classes.helveticaBold}
                    width="125px"
                    size="large"
                    color="primary"
                    onClick={onSubmit}>
                    {t.verify()}
                </PrimaryButton>
            </div>
        </>
    )
})

const CreateMnemonicUI = memo<CreateMnemonicUIProps>(({ words, hasPassword, onRefreshWords, onVerifyClick }) => {
    const t = useDashboardI18N()
    const ref = useRef(null)
    const location = useLocation()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const theme = useTheme()
    const [copyState, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const [, handleDownload] = useAsyncFn(async () => {
        if (!ref.current) return
        const dataUrl = await toBlob(ref.current, { quality: 0.95 })
        if (!dataUrl) return

        const link = document.createElement('a')
        link.download = 'mask-wallet-mnemonic.jpeg'
        link.href = URL.createObjectURL(dataUrl)
        link.click()
    }, [])

    const { value: address } = useAsync(async () => {
        const name = new URLSearchParams(location.search).get('name')
        const password = location.state?.password
        // if the name doesn't exist, navigate to form page
        if (!name) {
            return
        }

        if (!hasPassword) {
            await PluginServices.Wallet.setPassword(password)
        }

        if (!words.length) return

        const address = await PluginServices.Wallet.recoverWalletFromMnemonic(
            'mask-wallet',
            words.join(' '),
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
        )

        return address
    }, [location.search, words, hasPassword, searchParams])

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
        <>
            <Typography className={cx(classes.title, classes.helveticaBold)}>
                {t.write_down_recovery_phrase()}
            </Typography>
            <Typography className={classes.tips}>{t.store_recovery_phrase_tip()}</Typography>
            <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                <Button className={classes.refresh} variant="text" onClick={onRefreshWords}>
                    <Icons.Refresh size={16} />
                    {t.refresh()}
                </Button>
            </Stack>
            <div className={classes.words}>
                <MnemonicReveal words={words} indexed />
            </div>
            <div className={classes.storeWords}>
                <div className={classes.storeIcon} onClick={handleDownload}>
                    <Icons.Download2 color={theme.palette.maskColor.main} size={18} />
                </div>
                <div className={classes.storeIcon} onClick={() => copyToClipboard(words.join(' '))}>
                    <Icons.Copy color={theme.palette.maskColor.main} size={18} />
                </div>
            </div>
            <Alert icon={<Icons.WarningTriangle />} severity="warning" className={classes.alert}>
                {t.create_wallet_mnemonic_tip()}
            </Alert>

            <PrimaryButton
                className={classes.helveticaBold}
                width="125px"
                size="large"
                color="primary"
                onClick={onVerifyClick}>
                {t.create_wallet_mnemonic_keep_safe()}
            </PrimaryButton>

            <Box sx={{ position: 'absolute', top: -9999 }}>
                <ComponentToPrint ref={ref} words={words} address={address ?? ''} />
            </Box>
        </>
    )
})

export default CreateMnemonic
