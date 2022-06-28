import { Box, Button, DialogContent, DialogActions, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { GoodGhostingInfo } from '../types'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { useI18N } from '../../../utils'
import { useGameToken } from '../hooks/usePoolData'
import { formatBalance, FungibleToken, isGreaterThanOrEqualTo, NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
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
    actionSection: {
        textAlign: 'center',
        width: '100%',
    },
}))

interface GameActionDialogProps {
    open: boolean
    titleText: string
    bodyText: string
    actionText: string
    onAction: () => void
    onClose: () => void
    token: FungibleToken<ChainId, SchemaType> | undefined
    info: GoodGhostingInfo
    needsApprove: boolean
}

export function GameActionDialog(props: GameActionDialogProps) {
    const { open, onAction, onClose, bodyText, titleText, actionText, token, info, needsApprove } = props
    const { classes } = useStyles()
    const gameToken = useGameToken()
    const { t } = useI18N()

    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryLoadTokenBalance,
    } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, gameToken.address)

    const hasSufficientBalance =
        !loadingTokenBalance && !errorTokenBalance && isGreaterThanOrEqualTo(tokenBalance, info.segmentPayment)

    let action = (
        <div className={classes.actionSection}>
            <Button
                classes={{ root: classes.button }}
                color="primary"
                fullWidth
                disabled={needsApprove && !hasSufficientBalance}
                onClick={onAction}>
                {actionText}
            </Button>
            {needsApprove && !hasSufficientBalance && (
                <Typography variant="subtitle1" color={loadingTokenBalance ? 'textSecondary' : 'red'}>
                    {loadingTokenBalance
                        ? t('plugin_good_ghosting_checking_balance')
                        : t('plugin_good_ghosting_insufficient_balance', {
                              amount: formatBalance(info.segmentPayment, gameToken.decimals),
                              token: gameToken.symbol,
                          })}
                </Typography>
            )}
        </div>
    )

    if (needsApprove) {
        if (errorTokenBalance) {
            action = (
                <Button classes={{ root: classes.button }} color="primary" fullWidth onClick={retryLoadTokenBalance}>
                    {t('plugin_good_ghosting_balance_error')}
                </Button>
            )
        }

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
                <WalletConnectedBoundary>{action}</WalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
