import { Box, Button, DialogContent, DialogActions, makeStyles } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import type { GoodGhostingInfo } from '../types'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'

const useStyles = makeStyles((theme) => ({
    card: {
        padding: 0,
        border: `solid 1px ${theme.palette.divider}`,
        margin: `${theme.spacing(2)} auto`,
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
    },
    button: {
        width: '60%',
        minHeight: 39,
        margin: `${theme.spacing(1)} auto`,
    },
}))

interface GameActionDialogProps {
    open: boolean
    bodyText: string
    actionText: string
    onAction: () => void
    onClose: () => void
    token: ERC20TokenDetailed | undefined
    info: GoodGhostingInfo
    needsApprove: boolean
}

export function GameActionDialog(props: GameActionDialogProps) {
    const { open, onAction, onClose, bodyText, actionText, token, info, needsApprove } = props
    const classes = useStyles()

    let action = (
        <Button classes={{ root: classes.button }} color="primary" variant="contained" fullWidth onClick={onAction}>
            {actionText}
        </Button>
    )

    if (needsApprove) {
        action = (
            <EthereumERC20TokenApprovedBoundary
                amount={info.segmentPayment}
                spender={props.info.contractAddress}
                token={token}>
                {action}
            </EthereumERC20TokenApprovedBoundary>
        )
    }

    return (
        <InjectedDialog open={open} onClose={onClose} title=" ">
            <DialogContent>
                <Box>{bodyText}</Box>
            </DialogContent>
            <DialogActions>
                <EthereumWalletConnectedBoundary>{action}</EthereumWalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
