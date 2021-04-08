import { useContext, useState } from 'react'
import classNames from 'classnames'
import { Button } from '@material-ui/core'
import { SnapshotContext } from '../context'
import { createStyles, makeStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'
import { useProposal } from '../hooks/useProposal'
import { PluginSnapshotMessages } from '../messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'

const useStyles = makeStyles((theme) => {
    return createStyles({
        button: {
            width: '80%',
            margin: `${theme.spacing(1)} auto`,
        },
        choiceButton: {
            transitionDuration: '0s !important',
            '&:hover': {
                border: '2px solid rgb(29, 161, 242) !important',
                backgroundColor: 'transparent !important',
            },
        },
        buttonActive: {
            border: '2px solid rgb(29, 161, 242)',
            backgroundColor: 'transparent',
        },
    })
})

export function VotingCard() {
    const { t } = useI18N()
    const classes = useStyles()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { message },
    } = useProposal(identifier.id)

    const choices = message.payload.choices
    const [choice, setChoice] = useState(0)

    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginSnapshotMessages.events.voteConfirmDialogUpdated)

    return (
        <SnapshotCard title={t('plugin_snapshot_vote_title')}>
            {choices.map((choiceText, i) => (
                <Button
                    onClick={() => setChoice(i + 1)}
                    className={classNames([
                        classes.button,
                        classes.choiceButton,
                        ...(choice === i + 1 ? [classes.buttonActive] : []),
                    ])}
                    variant="outlined">
                    {choiceText}
                </Button>
            ))}
            <Button
                className={classes.button}
                variant="contained"
                onClick={() => {
                    console.log('setBuyDialogOpen')
                    setBuyDialogOpen({ open: true })
                }}>
                {t('plugin_snapshot_vote')}
            </Button>
        </SnapshotCard>
    )
}
