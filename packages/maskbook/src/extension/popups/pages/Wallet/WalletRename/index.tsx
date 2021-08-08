import { memo, useState } from 'react'
import { Button, makeStyles, Typography } from '@material-ui/core'
import { StyledInput } from '../../../components/StyledInput'
import { useWallet } from '@masknet/web3-shared'
import { useSnackbarCallback } from '@masknet/shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

const useStyles = makeStyles(() => ({
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
}))

const WalletRename = memo(() => {
    const classes = useStyles()
    const wallet = useWallet()
    const [name, setName] = useState('')
    const renameWallet = useSnackbarCallback(() => {
        if (!wallet?.address) {
            throw new Error('Not select wallet yet.')
        }
        return WalletRPC.renameWallet(wallet.address, name)
    }, [wallet?.address])
    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.title}>Rename</Typography>
            </div>
            <div className={classes.content}>
                <StyledInput value={name} onChange={(e) => setName(e.target.value)} />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!name}
                    className={classes.button}
                    onClick={renameWallet}>
                    Confirm
                </Button>
            </div>
        </>
    )
})

export default WalletRename
