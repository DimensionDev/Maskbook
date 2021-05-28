import { useContext, useState, useEffect } from 'react'
import classNames from 'classnames'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import { useI18N, useSnackbarCallback } from '../../../utils'
import { SnapshotContext } from '../context'
import { useAccount } from '../../../web3/hooks/useAccount'
import { PluginSnapshotRPC } from '../messages'
import { SnapshotCard } from './SnapshotCard'
import { useProposal } from '../hooks/useProposal'
import { usePower } from '../hooks/usePower'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { VoteConfirmDialog } from './VoteConfirmDialog'
import { useRetry } from '../hooks/useRetry'

const useStyles = makeStyles((theme) => {
    return {
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
    }
})

export function VotingCard() {
    const { t } = useI18N()
    const classes = useStyles()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { message },
    } = useProposal(identifier.id)
    const account = useAccount()
    const { value: power } = usePower(identifier)
    const choices = message.payload.choices
    const [choice, setChoice] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const retry = useRetry()
    const onVoteConfirm = useSnackbarCallback(
        () => {
            setLoading(true)
            return PluginSnapshotRPC.vote(identifier, choice, account)
        },
        [choice, identifier, account],
        () => {
            setLoading(false)
            setOpen(false)
            retry()
        },
        (_err: Error) => setLoading(false),
        void 0,
        t('plugin_snapshot_vote'),
        t('plugin_snapshot_vote_success'),
    )

    useEffect(() => {
        setOpen(false)
    }, [account, power, setOpen])

    return (
        <SnapshotCard title={t('plugin_snapshot_vote_title')}>
            {choices.map((choiceText, i) => (
                <Button
                    key={i}
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
                classes={{ connectWallet: classes.button, unlockMetaMask: classes.button }}
                offChain={true}>
                <Button
                    className={classes.button}
                    variant="contained"
                    disabled={choice === 0 || !Boolean(account) || !Boolean(power)}
                    onClick={() => setOpen(true)}>
                    {Boolean(power) && Boolean(account) ? t('plugin_snapshot_vote') : t('plugin_snapshot_no_power')}
                </Button>
            </EthereumWalletConnectedBoundary>
            <VoteConfirmDialog
                open={open}
                loading={loading}
                onClose={() => setOpen(false)}
                choiceText={choices[choice - 1]}
                message={message}
                power={power}
                onVoteConfirm={onVoteConfirm}
            />
        </SnapshotCard>
    )
}
