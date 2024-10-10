import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import urlcat from 'urlcat'
import { toBlob } from 'html-to-image'
import { Icons } from '@masknet/icons'
import { timeout } from '@masknet/kit'
import { CopyButton } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { MaskWalletProvider, EVMWeb3 } from '@masknet/web3-providers'
import { generateNewWalletName, isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Alert, Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material'
import Services from '#services'
import { MnemonicReveal } from '../../../components/Mnemonic/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useMnemonicWordsPuzzle, type PuzzleWord } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { ResetWalletContext } from '../context.js'
import { ComponentToPrint } from './ComponentToPrint.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
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
        cursor: 'pointer',
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

async function pollResult(address: string) {
    const subscription = MaskWalletProvider.subscription.wallets
    if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) return
    const { promise, resolve } = Promise.withResolvers()
    const unsubscribe = subscription.subscribe(() => {
        if (subscription.getCurrentValue().find((x) => isSameAddress(x.address, address))) resolve(true)
    })
    return timeout(promise, 10_000, 'It takes too long to create a wallet. You might try again.').finally(unsubscribe)
}

export const Component = memo(function CreateMnemonic() {
    const location = useLocation()
    const navigate = useNavigate()
    const wallets = useWallets()
    const walletName = generateNewWalletName(wallets)
    const { handlePasswordAndWallets } = ResetWalletContext.useContainer()
    const [verified, setVerified] = useState(false)
    const { classes, cx } = useStyles()
    const { words, refreshCallback, puzzleWordList, answerCallback, puzzleAnswer, verifyAnswerCallback, isMatched } =
        useMnemonicWordsPuzzle()

    const onVerifyClick = useCallback(() => {
        setVerified(true)
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(urlcat(DashboardRoutes.RecoveryMaskWallet, {}), {
            state: {
                password: location.state?.password,
                isReset: location.state?.isReset,
            },
        })
    }, [location.state?.password, location.state?.isReset])

    const { value: hasPassword, loading: loadingHasPassword } = useAsync(Services.Wallet.hasPassword, [])

    const { value: address } = useAsync(async () => {
        if (!words.length) return

        if (!hasPassword) await Services.Wallet.setDefaultPassword()

        const address = await Services.Wallet.generateAddressFromMnemonicWords(walletName, words.join(' '))
        return address
    }, [words.join(' '), walletName, hasPassword])

    const [{ loading }, onSubmit] = useAsyncFn(async () => {
        const result = await handlePasswordAndWallets(location.state?.password, location.state?.isReset)
        if (!result) return
        const address = await Services.Wallet.createWalletFromMnemonicWords(walletName, words.join(' '))
        await pollResult(address)
        await EVMWeb3.connect({
            silent: true,
            providerType: ProviderType.MaskWallet,
            account: address,
        })
        await Services.Wallet.resolveMaskAccount([{ address }])
        Telemetry.captureEvent(EventType.Access, EventID.EntryPopupWalletCreate)
        navigate(urlcat(DashboardRoutes.SignUpMaskWalletOnboarding, {}), { replace: true })
    }, [walletName, words, location.state?.isReset, location.state?.password])

    const step = useMemo(() => (verified ? 3 : 2) - (hasPassword ? 1 : 0), [verified, hasPassword])
    const totalSteps = hasPassword ? '2' : '3'

    return (
        <>
            <div className={classes.between}>
                <Typography className={cx(classes.second, classes.bold)}>
                    {loadingHasPassword ?
                        ''
                    :   <Trans>
                            Step {step}/{totalSteps}
                        </Trans>
                    }
                </Typography>

                <Typography className={cx(classes.import, classes.bold)} onClick={handleRecovery}>
                    <Trans>Import</Trans>
                </Typography>
            </div>
            {verified ?
                <VerifyMnemonicUI
                    setVerified={setVerified}
                    words={words}
                    loading={loading}
                    isMatched={isMatched}
                    answerCallback={answerCallback}
                    puzzleAnswer={puzzleAnswer}
                    onRefreshWords={refreshCallback}
                    verifyAnswerCallback={verifyAnswerCallback}
                    puzzleWordList={puzzleWordList}
                    onSubmit={onSubmit}
                />
            :   <CreateMnemonicUI
                    address={address}
                    words={words}
                    onRefreshWords={refreshCallback}
                    onVerifyClick={onVerifyClick}
                />
            }
        </>
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
    onRefreshWords: () => void
    puzzleAnswer: {
        [key: number]: string
    }
    puzzleWordList: PuzzleWord[]
    loading: boolean
    isMatched: boolean | undefined
    setVerified: (verified: boolean) => void
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
    setVerified,
    onSubmit,
    loading,
    puzzleWordList,
    onRefreshWords,
    puzzleAnswer,
    verifyAnswerCallback,
    isMatched,
}) {
    const { classes, cx } = useStyles()

    const handleOnBack = useCallback(() => {
        onRefreshWords()
        setVerified(false)
    }, [])

    return (
        <>
            <Typography className={cx(classes.title, classes.bold)}>
                <Trans>Verify</Trans>
            </Typography>
            <Typography className={classes.tips}>
                <Trans>Please select the correct words in the correct order.</Trans>
            </Typography>
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
            {isMatched === false ?
                <Typography className={classes.verificationFail}>
                    <Trans>Incorrect words selected. Please try again!</Trans>
                </Typography>
            :   null}
            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton className={classes.bold} width="125px" size="large" onClick={handleOnBack}>
                        <Trans>Back</Trans>
                    </SecondaryButton>
                    <PrimaryButton
                        className={classes.bold}
                        width="125px"
                        disabled={loading || Object.entries(puzzleAnswer).length !== 3}
                        loading={loading}
                        size="large"
                        color="primary"
                        onClick={() => verifyAnswerCallback(onSubmit)}>
                        <Trans>Verify</Trans>
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </>
    )
})

const PuzzleOption = memo<PuzzleOption>(function PuzzleOption({ puzzleWord, puzzleAnswer, answerCallback }) {
    const { classes, cx } = useStyles()

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
                        {word === puzzleAnswer[puzzleWord.index] ?
                            <Icons.Checkbox size={18} className={classes.checkIcon} />
                        :   null}
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
    const ref = useRef(null)
    const { classes, cx } = useStyles()
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
            <Typography className={cx(classes.title, classes.bold)}>
                <Trans>Write down recovery phrase</Trans>
            </Typography>
            <Typography className={classes.tips}>
                <Trans>Please write down or copy these words and save them in a secure place.</Trans>
            </Typography>
            <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                <Button className={classes.refresh} variant="text" onClick={onRefreshWords}>
                    <Icons.Refresh size={16} />
                    <Trans>Refresh</Trans>
                </Button>
            </Stack>
            <div className={classes.words}>
                <MnemonicReveal words={words} indexed />
            </div>
            <div className={classes.storeWords}>
                <div className={classes.iconBox} onClick={handleDownload}>
                    <Icons.Download2 color={theme.palette.maskColor.main} size={18} />
                </div>
                <CopyButton
                    classes={{ root: classes.iconBox }}
                    color={theme.palette.maskColor.main}
                    size={18}
                    text={words.join(' ')}
                    successText={<Trans>The mnemonic word has been copied, please keep it in a safe place.</Trans>}
                />
            </div>
            <Alert icon={<Icons.WarningTriangle />} severity="warning" className={classes.alert}>
                <Trans>Never share 12-word secret mnemonic with anyone!</Trans>
            </Alert>
            <SetupFrameController>
                <PrimaryButton
                    className={cx(classes.bold, classes.button)}
                    width="125px"
                    size="large"
                    color="primary"
                    onClick={onVerifyClick}>
                    <Trans>Kept safely</Trans>
                </PrimaryButton>
            </SetupFrameController>

            <Box sx={{ position: 'absolute', top: -9999 }}>
                <ComponentToPrint ref={ref} words={words} address={address ?? ''} />
            </Box>
        </>
    )
})
