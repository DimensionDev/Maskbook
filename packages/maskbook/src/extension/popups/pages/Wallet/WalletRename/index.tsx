import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { StyledInput } from '../../../components/StyledInput'
import { useWallet } from '@masknet/web3-shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useHistory } from 'react-router'
import { useI18N } from '../../../../../utils'
import { useUpdateEffect } from 'react-use'

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
    const [name, setName] = useState('')
    const renameWallet = useCallback(async () => {
        if (!wallet?.address) return
        await WalletRPC.renameWallet(wallet.address, name)
        return history.goBack()
    }, [wallet?.address])

    useUpdateEffect(() => {
        if (wallet?.name) setName(wallet.name)
    }, [wallet?.name])

    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('rename')}</Typography>
            </div>
            <div className={classes.content}>
                <StyledInput value={name} onChange={(e) => setName(e.target.value)} defaultValue={wallet?.name} />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!name}
                    className={classes.button}
                    onClick={renameWallet}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    )
})

export default WalletRename
