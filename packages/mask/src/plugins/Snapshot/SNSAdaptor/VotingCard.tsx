import { useContext, useState, useEffect } from 'react'
import classNames from 'classnames'
import { Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SnapshotContext } from '../context'
import { toChecksumAddress } from 'web3-utils'
import { useAccount, useChainId, useWeb3Connection, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useSnackbarCallback } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { PluginSnapshotRPC } from '../messages'
import { SnapshotCard } from './SnapshotCard'
import { useProposal } from './hooks/useProposal'
import { usePower } from './hooks/usePower'
import { VoteConfirmDialog } from './VoteConfirmDialog'
import { useRetry } from './hooks/useRetry'
import { SNAPSHOT_VOTE_DOMAIN } from '../constants'
import { getSnapshotVoteType } from '../utils'

const useStyles = makeStyles()((theme) => {
    return {
        button: {
            width: '80%',
            minHeight: 39,
            margin: `${theme.spacing(1)} auto`,
        },
        choiceButton: {
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            transitionDuration: '0s !important',
            '&:hover': {
                border: '2px solid rgb(29, 161, 242) !important',
                backgroundColor: 'transparent !important',
            },
        },
        buttonActive: {
            border: '2px solid rgb(29, 161, 242)',
            backgroundColor: 'transparent',
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
        },
    }
})

export function VotingCard() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const identifier = useContext(SnapshotContext)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { payload: proposal } = useProposal(identifier.id)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value: power } = usePower(identifier)
    const choices = proposal.choices
    const [choice, setChoice] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const networkPluginId = useCurrentWeb3NetworkPluginID()
    const retry = useRetry()
    const onVoteConfirm = useSnackbarCallback(
        async () => {
            setLoading(true)
            const message = {
                from: toChecksumAddress(account),
                space: identifier.space,
                timestamp: Math.floor(Date.now() / 1e3),
                proposal: identifier.id,
                choice: proposal.type === 'single-choice' ? choice : [choice],
                metadata: JSON.stringify({}),
            }

            const domain = SNAPSHOT_VOTE_DOMAIN

            const types = getSnapshotVoteType(proposal.type)

            const data = {
                message,
                domain,
                types,
            }
            const sig = await connection?.signMessage(
                JSON.stringify({
                    domain,
                    types: {
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                        ],
                        Vote: types.Vote,
                    },
                    primaryType: 'Vote',
                    message,
                }),
                'typedDataSign',
                { account: toChecksumAddress(account) },
            )

            const body = JSON.stringify({ data, sig, address: toChecksumAddress(account) })

            return PluginSnapshotRPC.vote(body)
        },
        [choice, identifier, account, proposal, connection, chainId],
        () => {
            setLoading(false)
            setOpen(false)
            retry()
        },
        (_err: Error) => setLoading(false),
        void 0,
        t('plugin_snapshot_vote_success'),
    )

    useEffect(() => {
        setOpen(false)
    }, [account, power, setOpen])

    return (
        <SnapshotCard title={t('plugin_snapshot_vote_title')}>
            {account && networkPluginId === NetworkPluginID.PLUGIN_EVM ? (
                <>
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

                    <Button
                        className={classes.button}
                        disabled={choice === 0 || !account || !power}
                        onClick={() => setOpen(true)}>
                        {power && account ? t('plugin_snapshot_vote') : t('plugin_snapshot_no_power')}
                    </Button>
                </>
            ) : null}
            <VoteConfirmDialog
                open={open}
                loading={loading}
                onClose={() => setOpen(false)}
                choiceText={choices[choice - 1]}
                snapshot={proposal.snapshot}
                powerSymbol={proposal.space.symbol}
                power={power}
                onVoteConfirm={onVoteConfirm}
            />
        </SnapshotCard>
    )
}
