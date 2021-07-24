import { Box, Button, DialogContent, DialogActions, makeStyles, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { ERC20TokenDetailed, formatBalance } from '@masknet/web3-shared'
import type { GoodGhostingInfo } from '../types'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useI18N } from '../../../utils'
import { useGameToken } from '../hooks/usePoolData'

const useStyles = makeStyles((theme) => ({
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
    actionText: {
        textAlign: 'center',
        marginBottom: theme.spacing(5),
    },
}))

interface GameActionDialogProps {
    open: boolean
    titleText: string
    bodyText: string
    actionText: string
    onAction: () => void
    onClose: () => void
    token: ERC20TokenDetailed | undefined
    info: GoodGhostingInfo
    needsApprove: boolean
}

export function GameActionDialog(props: GameActionDialogProps) {
    const { open, onAction, onClose, bodyText, titleText, actionText, token, info, needsApprove } = props
    const classes = useStyles()
    const gameToken = useGameToken()
    const { t } = useI18N()

    let action = (
        <Button classes={{ root: classes.button }} color="primary" variant="contained" fullWidth onClick={onAction}>
            {actionText}
        </Button>
    )

    if (needsApprove) {
        action = (
            <EthereumERC20TokenApprovedBoundary
                amount={info.segmentPayment}
                spender={info.contractAddress}
                token={token}>
                {action}
            </EthereumERC20TokenApprovedBoundary>
        )
    }

    return (
        <InjectedDialog open={open} onClose={onClose} title={titleText}>
            <DialogContent>
                <Box>
                    <div className={classes.actionText}>
                        <Typography variant="h6" color="textPrimary">
                            {bodyText}
                        </Typography>
                    </div>

                    <Typography variant="h6" color="textSecondary">
                        {t('plugin_good_ghosting_rules')}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        {t('plugin_good_ghosting_game_rules', {
                            amount: formatBalance(info.segmentPayment, gameToken.decimals),
                            token: gameToken.symbol,
                            roundCount: info.lastSegment,
                        })}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <EthereumWalletConnectedBoundary>{action}</EthereumWalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
