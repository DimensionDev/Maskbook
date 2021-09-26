import { memo, useCallback, useState } from 'react'
import { Alert, Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { RefreshIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { MnemonicReveal } from '../../../../components/Mnemonic'
import { VerifyMnemonicDialog } from '../VerifyMnemonicDialog'
import { useAsyncFn } from 'react-use'
import { useLocation, useNavigate } from 'react-router'
import { PluginServices } from '../../../../API'
import { RoutePaths } from '../../../../type'

// Private key at m/purpose'/coin_type'/account'/change
export const HD_PATH_WITHOUT_INDEX_ETHEREUM = "m/44'/60'/0'/0"

const useStyles = makeStyles()({
    container: {
        padding: '120px 18%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
        fontWeight: 500,
    },
    refresh: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 24,
        fontSize: 14,
        lineHeight: '20px',
        width: '100%',
        color: MaskColorVar.linkText,
    },
    words: {
        marginTop: 24,
        backgroundColor: MaskColorVar.lightBackground,
        padding: 30,
        width: '100%',
    },
    controller: {
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 33%)',
        justifyContent: 'center',
        gridColumnGap: 10,
        padding: '27px 0',
        width: '100%',
    },
    button: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
    },
    alert: {
        marginTop: 24,
        padding: 24,
        width: '100%',
    },
})

const CreateMnemonic = memo(() => {
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const onVerifyClick = useCallback(() => {
        setOpen(true)
    }, [])

    const [walletState, onSubmit] = useAsyncFn(async () => {
        const name = new URLSearchParams(location.search).get('name')
        //#region if the name isn't exist, navigate to form page
        if (!name) {
            resetCallback()
            navigate(RoutePaths.CreateMaskWalletForm)
        }

        const address = await PluginServices.Wallet.importNewWallet(
            {
                name,
                path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                mnemonic: words,
                passphrase: '',
            },
            true,
        )

        await PluginServices.Wallet.addPhrase({
            path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
            mnemonic: words,
            passphrase: '',
        })

        return address
    }, [location.search, words, resetCallback])

    return (
        <>
            <CreateMnemonicUI words={words} onRefreshWords={refreshCallback} onVerifyClick={onVerifyClick} />
            <VerifyMnemonicDialog
                matched={words.join(' ') === puzzleWords.join(' ')}
                onUpdateAnswerWords={answerCallback}
                indexes={indexes}
                puzzleWords={puzzleWords}
                open={open}
                onClose={() => setOpen(false)}
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
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [open, setOpen] = useState(true)

    return (
        <div className={classes.container}>
            <Typography className={classes.title}>Create a wallet</Typography>
            <div className={classes.refresh}>
                <Box style={{ display: 'flex', cursor: 'pointer' }} onClick={onRefreshWords}>
                    <RefreshIcon />
                    <Typography>{t.wallets_create_wallet_refresh()}</Typography>
                </Box>
            </div>
            <div className={classes.words}>
                <MnemonicReveal words={words} />
            </div>
            <Box className={classes.controller}>
                <Button color="secondary" className={classes.button} onClick={() => navigate(-1)}>
                    {t.cancel()}
                </Button>
                <Button className={classes.button} onClick={onVerifyClick}>
                    {t.verify()}
                </Button>
            </Box>
            {open ? (
                <Alert severity="error" onClose={() => setOpen(false)} className={classes.alert}>
                    {t.create_wallet_mnemonic_tip()}
                </Alert>
            ) : null}
        </div>
    )
})

export default CreateMnemonic
