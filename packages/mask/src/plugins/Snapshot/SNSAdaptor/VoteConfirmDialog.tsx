import { Link, DialogContent, DialogActions, Typography } from '@mui/material'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import millify from 'millify'
import OpenInNew from '@mui/icons-material/OpenInNew'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { PluginWalletStatusBar, useI18N } from '../../../utils/index.js'
import { InjectedDialog } from '@masknet/shared'
import { InfoField } from './InformationCard.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'flex',
        color: 'inherit',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        textDecoration: 'none !important',
    },
    loading: {
        color: theme.palette.background.paper,
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
    shadowRootTooltip: {
        color: theme.palette.maskColor.white,
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
    chainId: number
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
                        title={<Typography className={classes.shadowRootTooltip}>{choiceText}</Typography>}
                        placement="top"
                        arrow>
                        <Typography
                            sx={{
                                textAlign: 'right',
                                width: 200,
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
                    {millify(power, { precision: 2, lowercase: true })} {powerSymbol.toUpperCase()}
                </InfoField>
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <WalletConnectedBoundary offChain classes={{ button: classes.button }}>
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
