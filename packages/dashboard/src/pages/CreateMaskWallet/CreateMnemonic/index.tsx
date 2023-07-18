import { toBlob } from 'html-to-image'
import { memo, useCallback, useRef, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, alpha, Box, Button, Stack, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { MnemonicReveal } from '../../../components/Mnemonic/index.js'
import { PluginServices } from '../../../API.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { ResetWalletContext } from '../context.js'
import { useMnemonicWordsPuzzle, type PuzzleWord } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { ComponentToPrint } from './ComponentToPrint.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'

const useStyles = makeStyles<{ isVerify: boolean }>()((theme, { isVerify }) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
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
        whiteSpace: 'nowrap',
    },
    leftSide: {
        width: '90%',
        maxWidth: isVerify ? 720 : 948,
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
    bold: {
        fontWeight: 700,
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
    iconBox: {
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
    puzzleWord: {
        display: 'flex',
        padding: '12px',
        alignItems: 'center',
        gap: '12px',
        alignSelf: 'stretch',
        background: theme.palette.maskColor.bg,
        borderRadius: '12px',
    },
    puzzleWordList: {
        display: 'flex',
        padding: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        alignSelf: 'stretch',
    },
    puzzleWordIndex: {
        display: 'flex',
        fontSize: 14,
        color: theme.palette.maskColor.third,
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 38,
    },
    puzzleOption: {
        display: 'flex',
        width: 180,
        padding: '9px 8px',
        alignItems: 'center',
        marginRight: 24,
    },
    puzzleWordText: {
        fontSize: 14,
        fontWeight: 700,
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        width: 18,
        height: 18,
        borderRadius: '99px',
        overflow: 'hidden',
    },
    checkIcon: {
        width: 20,
        height: 20,
        color: theme.palette.maskColor.primary,
    },
    emptyCheckbox: {
        border: `2px solid ${theme.palette.maskColor.secondaryLine}`,
        background: 'transparent',
    },
    verificationFail: {
        color: theme.palette.maskColor.danger,
        fontSize: 14,
        fontWeight: 400,
    },
}))

const CreateMnemonic = memo(function CreateMnemonic() {
    const location = useLocation()
    const navigate = useNavigate()
    const walletName = 'Wallet 1'
    const t = useDashboardI18N()
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()
    const [isVerify, setIsVerify] = useState(false)
    const { classes, cx } = useStyles({ isVerify })
    const { words, refreshCallback, puzzleWordList, answerCallback, puzzleAnswer, verifyAnswerCallback, isMatched } =
        useMnemonicWordsPuzzle()

    const onVerifyClick = useCallback(() => {
        setIsVerify(true)
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.RecoveryMaskWallet, {
            state: {
                password: location.state?.password,
                isReset: location.state?.isReset,
            },
        })
    }, [location.state?.password, location.state?.isReset])

    const { value: address } = useAsync(async () => {
        if (!words.length) return

        const hasPassword = await PluginServices.Wallet.hasPassword()
        if (!hasPassword) await PluginServices.Wallet.setDefaultPassword()

        const address = await PluginServices.Wallet.generateAddressFromMnemonicWords(walletName, words.join(' '))
        return address
    }, [words.join(' '), walletName])

    const [{ loading }, onSubmit] = useAsyncFn(async () => {
        handlePasswordAndWallets(location.state?.password, location.state?.isReset)

        const address = await PluginServices.Wallet.recoverWalletFromMnemonicWords(walletName, words.join(' '))

        await PluginServices.Wallet.resolveMaskAccount([
            {
                address,
            },
        ])

        navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
    }, [walletName, words.join(' '), location.state?.isReset, location.state?.password])

    return (
        <div className={classes.container}>
            <div className={classes.leftSide}>
                <div className={classes.between}>
                    <Typography className={cx(classes.second, classes.bold)}>
                        {t.create_step({ step: isVerify ? '3' : '2', total: '3' })}
                    </Typography>
                    <Typography className={cx(classes.import, classes.bold)} onClick={handleRecovery}>
                        {t.wallets_import_wallet_import()}
                    </Typography>
                </div>
                {isVerify ? (
                    <VerifyMnemonicUI
                        isReset={location.state?.isReset}
                        setIsVerify={setIsVerify}
                        words={words}
                        loading={loading}
                        isMatched={isMatched}
                        answerCallback={answerCallback}
                        puzzleAnswer={puzzleAnswer}
                        verifyAnswerCallback={verifyAnswerCallback}
                        puzzleWordList={puzzleWordList}
                        onSubmit={onSubmit}
                    />
                ) : (
                    <CreateMnemonicUI
                        address={address}
                        words={words}
                        onRefreshWords={refreshCallback}
                        onVerifyClick={onVerifyClick}
                    />
                )}
            </div>
        </div>
    )
})

interface CreateMnemonicUIProps {
    words: string[]
    address: string | null | undefined
    onRefreshWords: () => void
    onVerifyClick: () => void
}

interface VerifyMnemonicUIProps {
    words: string[]
    answerCallback: (index: number, word: string) => void
    verifyAnswerCallback: (callback?: () => void) => void
    puzzleAnswer: {
        [key: number]: string
    }
    puzzleWordList: PuzzleWord[]
    isReset: boolean
    loading: boolean
    isMatched: boolean | undefined
    setIsVerify: (isVerify: boolean) => void
    onSubmit: () => void
}

interface PuzzleOption {
    puzzleWord: PuzzleWord
    puzzleAnswer: {
        [key: number]: string
    }
    answerCallback: (index: number, word: string) => void
}

const VerifyMnemonicUI = memo<VerifyMnemonicUIProps>(function VerifyMnemonicUI({
    answerCallback,
    setIsVerify,
    onSubmit,
    loading,
    isReset,
    puzzleWordList,
    puzzleAnswer,
    verifyAnswerCallback,
    isMatched,
}) {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles({ isVerify: true })

    return (
        <>
            <Typography className={cx(classes.title, classes.bold)}>
                {t.wallets_create_wallet_verification()}
            </Typography>
            <Typography className={classes.tips}>{t.create_wallet_verify_words()}</Typography>
            <Box component="ul" className={classes.puzzleWordList}>
                {puzzleWordList.map((puzzleWord, index) => (
                    <section key={index} className={classes.puzzleWord}>
                        <Typography className={classes.puzzleWordIndex}>{puzzleWord.index + 1}.</Typography>
                        <PuzzleOption
                            puzzleWord={puzzleWord}
                            answerCallback={answerCallback}
                            puzzleAnswer={puzzleAnswer}
                        />
                    </section>
                ))}
            </Box>
            {isMatched === false ? (
                <Typography className={classes.verificationFail}>
                    {t.create_wallet_mnemonic_verification_fail()}
                </Typography>
            ) : null}
            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton
                        className={classes.bold}
                        width="125px"
                        size="large"
                        onClick={() => setIsVerify(false)}>
                        {t.back()}
                    </SecondaryButton>
                    <PrimaryButton
                        className={classes.bold}
                        width="125px"
                        disabled={loading}
                        loading={loading}
                        size="large"
                        color="primary"
                        onClick={() => verifyAnswerCallback(onSubmit)}>
                        {isReset ? t.restore() : t.verify()}
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </>
    )
})

const PuzzleOption = memo<PuzzleOption>(function PuzzleOption({ puzzleWord, puzzleAnswer, answerCallback }) {
    const { classes, cx } = useStyles({ isVerify: false })

    return (
        <>
            {puzzleWord.options.map((word, index) => (
                <section
                    key={index}
                    className={classes.puzzleOption}
                    onClick={() => answerCallback(puzzleWord.index, word)}>
                    <div
                        className={cx(
                            classes.iconWrapper,
                            word !== puzzleAnswer[puzzleWord.index] ? classes.emptyCheckbox : '',
                        )}>
                        {word === puzzleAnswer[puzzleWord.index] ? (
                            <Icons.Checkbox size={18} className={classes.checkIcon} />
                        ) : null}
                    </div>

                    <Typography className={classes.puzzleWordText}>{word}</Typography>
                </section>
            ))}
        </>
    )
})

const CreateMnemonicUI = memo<CreateMnemonicUIProps>(function CreateMnemonicUI({
    words,
    onRefreshWords,
    onVerifyClick,
    address,
}) {
    const t = useDashboardI18N()
    const ref = useRef(null)
    const { classes, cx } = useStyles({ isVerify: false })
    const theme = useTheme()

    const [, handleDownload] = useAsyncFn(async () => {
        if (!ref.current) return
        const dataUrl = await toBlob(ref.current, { quality: 0.95 })
        if (!dataUrl) return

        const link = document.createElement('a')
        link.download = 'mask-wallet-mnemonic.jpeg'
        link.href = URL.createObjectURL(dataUrl)
        link.click()
    }, [])

    return (
        <>
            <Typography className={cx(classes.title, classes.bold)}>{t.write_down_recovery_phrase()}</Typography>
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
                <div className={classes.iconBox} onClick={handleDownload}>
                    <Icons.Download2 color={theme.palette.maskColor.main} size={18} />
                </div>
                <div className={classes.iconBox}>
                    <CopyButton
                        color={theme.palette.maskColor.main}
                        size={18}
                        text={words.join(' ')}
                        successText={t.persona_phrase_copy_description()}
                    />
                </div>
            </div>
            <Alert icon={<Icons.WarningTriangle />} severity="warning" className={classes.alert}>
                {t.create_wallet_mnemonic_tip()}
            </Alert>
            <SetupFrameController>
                <PrimaryButton
                    className={cx(classes.bold, classes.button)}
                    width="125px"
                    size="large"
                    color="primary"
                    onClick={onVerifyClick}>
                    {t.create_wallet_mnemonic_keep_safe()}
                </PrimaryButton>
            </SetupFrameController>

            <Box sx={{ position: 'absolute', top: -9999 }}>
                <ComponentToPrint ref={ref} words={words} address={address ?? ''} />
            </Box>
        </>
    )
})

export default CreateMnemonic
