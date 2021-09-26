import { IconButton, InputAdornment, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import { useCopyToClipboard } from 'react-use'
import { QRCode, useSnackbarCallback } from '@masknet/shared'
import type { Wallet } from '@masknet/web3-shared'
import { useI18N } from '../../../../utils'

const useReceiveTabStyles = makeStyles()((theme) => ({
    qr: {
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        padding: theme.spacing(1),
    },
}))

interface ReceiveTabProps {
    wallet: Wallet
    onClose: () => void
}

export function ReceiveTab(props: ReceiveTabProps) {
    const { wallet } = props
    const { t } = useI18N()
    const { classes } = useReceiveTabStyles()
    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <>
            <form className={classes.form}>
                <TextField
                    required
                    label={t('wallet_address')}
                    value={wallet.address}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation()
                                        copyWalletAddress(wallet.address)
                                    }}>
                                    <FileCopyOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />
            </form>
            <div className={classes.qr}>
                <QRCode
                    text={`ethereum:${wallet.address}`}
                    options={{ width: 200 }}
                    canvasProps={{
                        style: { display: 'block', margin: 'auto' },
                    }}
                />
            </div>
        </>
    )
}
