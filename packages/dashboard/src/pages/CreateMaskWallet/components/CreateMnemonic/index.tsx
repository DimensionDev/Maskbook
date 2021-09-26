import { memo, useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { RefreshIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { MnemonicReveal } from '../../../../components/Mnemonic'
import { VerifyMnemonicDialog } from '../VerifyMnemonicDialog'
import { useAsyncFn } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { PluginServices } from '../../../../API'
import { RoutePaths } from '../../../../type'
import type { Search } from 'history'

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
    const location = useLocation() as { search: Search; state: { password: string } }
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    const onVerifyClick = useCallback(() => {
        setOpen(true)
    }, [])

    const [walletState, onSubmit] = useAsyncFn(async () => {
        const name = new URLSearchParams(location.search).get('name')
        const password = location.state?.password
        // if the name doesn't exist, navigate to form page
        if (!name) {
            resetCallback()
            navigate(RoutePaths.CreateMaskWalletForm)
            return
        }

        await PluginServices.Wallet.setPassword(password)

        return PluginServices.Wallet.recoverWalletFromMnemonic(
            name,
            words.join(' '),
            `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
        )
    }, [location.search, words, resetCallback])

    const onClose = useCallback(() => {
        refreshCallback()
        resetCallback()
        setOpen(false)
    }, [refreshCallback, resetCallback])

    useEffect(() => {
        if (!location.state.password) navigate(-1)
    }, [location.state])

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
