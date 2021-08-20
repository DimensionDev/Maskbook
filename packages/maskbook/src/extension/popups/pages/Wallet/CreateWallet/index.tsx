import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { StyledInput } from '../../../components/StyledInput'
import { useHistory } from 'react-router-dom'
import { useWalletHD } from '../../../../../plugins/Wallet/hooks/useWalletHD'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'

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
    const [name, setName] = useState('')
    const hdWallet = useWalletHD()

    const onCreate = useCallback(async () => {
        if (hdWallet) {
            await WalletRPC.deriveWalletFromPhrase(name, hdWallet.mnemonic, hdWallet.passphrase)
            history.goBack()
        }
    }, [hdWallet, name])

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>New Wallet</Typography>
                <NetworkSelector />
            </div>
            <div className={classes.content}>
                <div>
                    <Typography className={classes.label}>Wallet Name</Typography>
                    <StyledInput
                        placeholder={t('popups_wallet_enter_your_wallet_name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <Button variant="contained" className={classes.button} disabled={!name} onClick={onCreate}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    )
})

export default CreateWallet
