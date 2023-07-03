import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Check as CheckIcon } from '@mui/icons-material'
import { useAsync, useAsyncFn, useAsyncRetry, useCopyToClipboard } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, alpha, Box, Button, Stack, Typography, useTheme } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { DashboardRoutes } from '@masknet/shared-base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { useDashboardI18N } from '../../../locales/index.js'
import { MnemonicReveal } from '../../../components/Mnemonic/index.js'
import { PluginServices } from '../../../API.js'
import { useMnemonicWordsPuzzle, type PuzzleWord } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { ComponentToPrint } from './ComponentToPrint.js'
import { toBlob } from 'html-to-image'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/CreateWalletFrame/index.js'
import { isUndefined } from 'lodash-es'
import { walletName } from '../constants.js'

const useStyles = makeStyles<{ isVerify: boolean }>()((theme, { isVerify }) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
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
        fontFamily: 'Helvetica',
        fontWeight: 700,
    },
    checkIconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        width: 20,
        height: 20,
        borderRadius: 999,
        marginRight: 8,
        border: `2px solid ${theme.palette.maskColor.secondaryLine}`,
        backgroundColor: 'transparent',
    },
    checked: {
        borderColor: `${theme.palette.maskColor.primary} !important`,
        backgroundColor: `${theme.palette.maskColor.primary} !important`,
    },
    checkedText: {
        color: theme.palette.maskColor.white,
    },
    checkIcon: {
        width: 18,
        height: 18,
        color: 'transparent',
    },
    verificationFail: {
        color: theme.palette.maskColor.danger,
        fontSize: 14,
        fontFamily: 'Helvetica',
        fontWeight: 400,
    },
}))

const CreateMnemonic = memo(() => {
    const location = useLocation()
    const navigate = useNavigate()
    const t = useDashboardI18N()

    const [isVerify, setIsVerify] = useState(false)
    const { classes, cx } = useStyles({ isVerify })
    const { words, refreshCallback, puzzleWordList, answerCallback, puzzleAnswer, verifyAnswerCallback, isMatched } =
        useMnemonicWordsPuzzle()

    const { value: hasPassword, retry } = useAsyncRetry(PluginServices.Wallet.hasPassword, [])

    const onVerifyClick = useCallback(() => {
        setIsVerify(true)
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.RecoveryMaskWallet)
    }, [])

    const { value: address } = useAsync(async () => {
        const password = location.state?.password
        if (isUndefined(hasPassword)) return

        if (hasPassword === false) {
            await PluginServices.Wallet.setPassword(password)
        }

        if (!words.length) return

        const address = await PluginServices.Wallet.generateAddressFromMnemonic(
            walletName,
            words.join(' '),
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
        )

        return address
    }, [JSON.stringify(words), hasPassword, location.state?.password])

    const [, onSubmit] = useAsyncFn(async () => {
        const address = await PluginServices.Wallet.recoverWalletFromMnemonic(
            walletName,
            words.join(' '),
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
        )

        await PluginServices.Wallet.resolveMaskAccount([
            {
                address,
            },
        ])

        navigate(DashboardRoutes.SignUpMaskWalletOnboarding, { replace: true })
    }, [walletName, JSON.stringify(words)])

    return (
        <div className={classes.container}>
            <div className={classes.leftSide}>
                <div className={classes.between}>
                    <Typography className={cx(classes.second, classes.helveticaBold)}>
                        {t.create_step({ step: isVerify ? '3' : '2', total: '3' })}
                    </Typography>
                    <Typography className={cx(classes.import, classes.helveticaBold)} onClick={handleRecovery}>
                        {t.wallets_import_wallet_import()}
                    </Typography>
                </div>
                {isVerify ? (
                    <VerifyMnemonicUI
                        setIsVerify={setIsVerify}
                        words={words}
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

const VerifyMnemonicUI = memo<VerifyMnemonicUIProps>(
    ({ answerCallback, setIsVerify, onSubmit, puzzleWordList, puzzleAnswer, verifyAnswerCallback, isMatched }) => {
        const t = useDashboardI18N()
        const { classes, cx } = useStyles({ isVerify: true })

        return (
            <>
                <Typography className={cx(classes.title, classes.helveticaBold)}>
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
                            onClick={() => verifyAnswerCallback(onSubmit)}>
                            {t.verify()}
                        </PrimaryButton>
                    </div>
                </SetupFrameController>
            </>
        )
    },
)

const PuzzleOption = memo<PuzzleOption>(({ puzzleWord, puzzleAnswer, answerCallback }) => {
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
                            classes.checkIconWrapper,
                            word === puzzleAnswer[puzzleWord.index] ? classes.checked : '',
                        )}>
                        <CheckIcon
                            className={cx(
                                classes.checkIcon,
                                word === puzzleAnswer[puzzleWord.index] ? classes.checkedText : '',
                            )}
                        />
                    </div>
                    <Typography className={classes.puzzleWordText}>{word}</Typography>
                </section>
            ))}
        </>
    )
})

const CreateMnemonicUI = memo<CreateMnemonicUIProps>(({ words, onRefreshWords, onVerifyClick, address }) => {
    const t = useDashboardI18N()
    const ref = useRef(null)
    const { classes, cx } = useStyles({ isVerify: false })
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
            <SetupFrameController>
                <PrimaryButton
                    className={cx(classes.helveticaBold, classes.button)}
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
