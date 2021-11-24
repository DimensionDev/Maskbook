import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { DialogContent, Box, DialogActions, Button, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(5, 5, 10),
    },
    icon: {
        width: 36,
        height: 36,
    },
    symbol: {
        marginLeft: theme.spacing(2.5),
    },
    token: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 28,
        color: theme.palette.common.black,
    },
}))

interface ClaimDialogUIProps extends InjectedDialogProps {
    amount: string
    token?: ERC20TokenDetailed
    onClaim: () => void
}

function ClaimDialogUI(props: ClaimDialogUIProps) {
    const { open, amount, token, onClaim, onClose } = props
    const classes = useStylesExtends(useStyles(), props)

    if (!token) return null

    return (
        <InjectedDialog open={open} onClose={onClose} maxWidth="xs" title="Claim Airdrop">
            <DialogContent className={classes.content}>
                <Box className={classes.token}>
                    <Box display="flex" alignItems="center">
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            name={token.name}
                            address={token.address}
                            logoURI={token.logoURI}
                        />
                        <Typography className={classes.symbol} color="textPrimary">
                            {token.symbol}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography color="textPrimary">{`${amount}.00`}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" sx={{ width: '100%' }} onClick={onClaim}>
                    Claim {`${amount}.00`} {token.symbol}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export interface ClaimDialogProps extends ClaimDialogUIProps {}

export function ClaimDialog(props: ClaimDialogProps) {
    return <ClaimDialogUI {...props} />
}
