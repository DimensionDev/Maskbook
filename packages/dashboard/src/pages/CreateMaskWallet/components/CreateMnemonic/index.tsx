import { memo } from 'react'
import { makeStyles, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { RefreshIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales/i18n_generated'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'

const useStyles = makeStyles(() => ({
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
}))

export const CreateMnemonic = memo(() => {
    const [words, puzzleWords, indexes, answerCallback, resetCallback, refreshCallback] = useMnemonicWordsPuzzle()

    return <CreateMnemonicUI />
})

export interface CreateMnemonicUIProps {
    words: string[]
}

export const CreateMnemonicUI = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <Typography className={classes.title}>Create a wallet</Typography>
            <div className={classes.refresh}>
                <RefreshIcon />
                <Typography>{t.wallets_create_wallet_refresh()}</Typography>
            </div>
        </div>
    )
})
