import { OpenInNew } from '@mui/icons-material'
import { Link, DialogContent, DialogActions, Typography } from '@mui/material'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginWalletStatusBar, InjectedDialog, WalletConnectedBoundary } from '@masknet/shared'
import { formatCount } from '@masknet/web3-shared-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { InfoField } from './InformationCard.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'flex',
        color: 'inherit',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        textDecoration: 'none !important',
    },
    field: {
        color: theme.palette.maskColor.second,
    },
    content: {
        padding: 16,
        '& > :first-child': {
            marginTop: 0,
        },
        height: 492,
    },
    button: {
        margin: 16,
    },
}))

interface VoteConfirmDialogProps {
    open: boolean
    loading: boolean
    snapshot: string
    powerSymbol: string
    onClose: () => void
    onVoteConfirm: () => void
    choiceText: string
    power: number | undefined
    chainId: ChainId
}

export function VoteConfirmDialog(props: VoteConfirmDialogProps) {
    const { open, onClose, onVoteConfirm, choiceText, snapshot, powerSymbol, power = 0, loading, chainId } = props

    const { classes } = useStyles()
    return (
        <InjectedDialog open={open} onClose={onClose} title={<Trans>Vote Overview</Trans>} disableBackdropClick>
            <DialogContent className={classes.content}>
                <InfoField classes={{ field: classes.field }} title={<Trans>Option(s)</Trans>}>
                    <ShadowRootTooltip
                        PopperProps={{
                            disablePortal: true,
                        }}
                        title={<Typography>{choiceText}</Typography>}
                        placement="top"
                        arrow>
                        <Typography
                            sx={{
                                textAlign: 'right',
                                width: 300,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}>
                            {choiceText}
                        </Typography>
                    </ShadowRootTooltip>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={<Trans>Snapshot</Trans>}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={EVMExplorerResolver.blockLink(chainId, Number.parseInt(snapshot, 10))}>
                        {snapshot}
                        <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={<Trans>Your voting power</Trans>}>
                    <Typography>
                        {formatCount(power, 2, true)} {powerSymbol.toUpperCase()}
                    </Typography>
                </InfoField>
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <WalletConnectedBoundary offChain classes={{ button: classes.button }} expectedChainId={chainId}>
                    <PluginWalletStatusBar>
                        <ActionButton
                            color="primary"
                            fullWidth
                            disabled={loading}
                            onClick={onVoteConfirm}
                            loading={loading}>
                            <Trans>Vote</Trans>
                        </ActionButton>
                    </PluginWalletStatusBar>
                </WalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
