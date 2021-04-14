import { useContext, useCallback, useState } from 'react'
import {
    Typography,
    Button,
    Card,
    CardContent,
    Link,
    DialogContent,
    DialogActions,
    createStyles,
    makeStyles,
} from '@material-ui/core'
import OpenInNew from '@material-ui/icons/OpenInNew'

import { SnapshotContext } from '../context'
import { useProposal } from '../hooks/useProposal'
import { resolveBlockLinkOnEtherscan } from '../../../web3/pipes'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useChainId } from '../../../web3/hooks/useChainState'
import { PluginSnapshotMessages } from '../messages'
import { InfoField } from './InformationCard'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            margin: `${theme.spacing(1)} auto`,
        },
        link: {
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            marginLeft: theme.spacing(1),
            textDecoration: 'none !important',
        },
    }),
)

export function VoteConfirmDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal, message },
    } = useProposal(identifier.id)
    const { snapshot } = message.payload
    const youPower = 0 //  TODO

    const [choiceText, setChoiceText] = useState('')

    //#region remote controlled buy token dialog
    const [open, setOpen] = useRemoteControlledDialog(PluginSnapshotMessages.events.voteConfirmDialogUpdated, (ev) => {
        if (ev.open) setChoiceText(ev.choiceText)
    })
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    const onConfirm = () => {
        // TODO
    }

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_snapshot_vote_confirm_dialog_title')}
            disableBackdropClick>
            <DialogContent>
                <Typography variant="h6" align="center">
                    <div>{t('plugin_snapshot_vote_confirm_dialog_choice', { choiceText })}</div>
                    <div>{t('plugin_snapshot_vote_confirm_dialog_warning')}</div>
                </Typography>
                <Card className={classes.card} variant="outlined">
                    <CardContent className={classes.content}>
                        <Typography>
                            <InfoField title={t('plugin_snapshot_vote_choice')}>{choiceText}</InfoField>
                            <InfoField title={t('plugin_snapshot_info_snapshot')}>
                                <Link
                                    className={classes.link}
                                    target="_blank"
                                    rel="noopener"
                                    href={resolveBlockLinkOnEtherscan(chainId, snapshot)}>
                                    {snapshot}
                                    <OpenInNew fontSize="small" />
                                </Link>
                            </InfoField>
                            <InfoField title={t('plugin_snapshot_vote_power')}>
                                {`${youPower} ${message.space.toUpperCase()}`}
                            </InfoField>
                        </Typography>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Button
                    classes={{ root: classes.button }}
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={onConfirm}>
                    {t('plugin_snapshot_vote')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
