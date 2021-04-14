import { useContext, useState } from 'react'
import classNames from 'classnames'
import { Button } from '@material-ui/core'
import { SnapshotContext } from '../context'
import { createStyles, makeStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'
import { useProposal } from '../hooks/useProposal'
import { usePower } from '../hooks/usePower'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { VoteConfirmDialog } from './VoteConfirmDialog'

const useStyles = makeStyles((theme) => {
    return createStyles({
        button: {
            width: '80%',
            minHeight: 39,
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

    const { value: power } = usePower(identifier)
    const choices = message.payload.choices
    const [choice, setChoice] = useState(0)
    const [open, setOpen] = useState(false)

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
            <EthereumWalletConnectedBoundary
                connectWalletButtonStyle={classes.button}
                unlockMetamaskButtonStyle={classes.button}>
                <Button
                    className={classes.button}
                    variant="contained"
                    disabled={choice === 0}
                    onClick={() => setOpen(true)}>
                    {t('plugin_snapshot_vote')}
                </Button>
            </EthereumWalletConnectedBoundary>
            <VoteConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                choiceText={choices[choice - 1]}
                message={message}
                power={power}
                onConfirm={() => {}}
            />
        </SnapshotCard>
    )
}
