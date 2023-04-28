import { Link, DialogContent, DialogActions, Typography } from '@mui/material'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { OpenInNew } from '@mui/icons-material'
import { type ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import { PluginWalletStatusBar, InjectedDialog, WalletConnectedBoundary } from '@masknet/shared'
import { useI18N } from '../../../utils/index.js'
import { InfoField } from './InformationCard.js'
import { formatCount } from '@masknet/web3-shared-base'

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
    const { t } = useI18N()

    const { classes } = useStyles()
    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_snapshot_vote_confirm_dialog_title')}
            disableBackdropClick>
            <DialogContent className={classes.content}>
                <InfoField classes={{ field: classes.field }} title={t('plugin_snapshot_vote_choice')}>
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
                <InfoField classes={{ field: classes.field }} title={t('plugin_snapshot_info_snapshot')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={explorerResolver.blockLink(chainId, Number.parseInt(snapshot, 10))}>
                        {snapshot}
                        <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={t('plugin_snapshot_vote_power')}>
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
                            {t('plugin_snapshot_vote')}
                        </ActionButton>
                    </PluginWalletStatusBar>
                </WalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
