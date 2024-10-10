import React, { useContext, useState, useMemo, unstable_useCacheRefresh } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { checksumAddress } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useSnackbarCallback } from '@masknet/shared'
import { EVMWeb3 } from '@masknet/web3-providers'
import { SnapshotCard } from './SnapshotCard.js'
import { useProposal } from './hooks/useProposal.js'
import { usePower } from './hooks/usePower.js'
import { VoteConfirmDialog } from './VoteConfirmDialog.js'
import { SnapshotContext } from '../context.js'
import { SNAPSHOT_VOTE_DOMAIN } from '../constants.js'
import { getSnapshotVoteType } from '../utils.js'
import { PluginSnapshotRPC } from '../messages.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        button: {
            height: 48,
            margin: `${theme.spacing(1)} auto`,
            '&.Mui-disabled': {
                backgroundColor: theme.palette.maskColor.publicThirdMain,
                color: theme.palette.maskColor.publicMain,
            },
        },
        choiceButton: {
            backgroundColor: theme.palette.maskColor.publicThirdMain,
            color: theme.palette.maskColor.publicMain,
            '&:hover': {
                backgroundColor: 'transparent',
            },
        },
        buttonActive: {
            backgroundColor: `${theme.palette.maskColor.publicMain} !important`,
            color: `${theme.palette.maskColor.white} !important`,
        },
        buttons: {
            '& > :first-child': {
                marginTop: 0,
            },
            '& > :last-child': {
                marginBottom: 0,
            },
        },
    }
})

export function VotingCard() {
    const { classes, cx } = useStyles()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: power } = usePower(identifier)
    const choices = proposal.choices
    const [choices_, setChoices_] = useState<number[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const messageText = (text: React.ReactNode) => (
        <Box>
            <Typography fontSize={14} fontWeight={700}>
                <Trans>Vote</Trans>
            </Typography>
            <Typography fontSize={14} fontWeight={400}>
                {text}
            </Typography>
        </Box>
    )
    const { pluginID } = useNetworkContext()
    const retry = unstable_useCacheRefresh()
    const onVoteConfirm = useSnackbarCallback(
        async () => {
            setLoading(true)
            const message = {
                from: checksumAddress(account),
                space: identifier.space,
                timestamp: Math.floor(Date.now() / 1000),
                proposal: identifier.id,
                choice: proposal.type === 'single-choice' ? choices_[0] : choices_,
                metadata: JSON.stringify({}),
            }
            const domain = SNAPSHOT_VOTE_DOMAIN
            const types = getSnapshotVoteType(proposal.type)
            const data = {
                message,
                domain,
                types,
            }
            const sig = await EVMWeb3.signMessage(
                'typedData',
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
                { account: checksumAddress(account) },
            )
            const body = JSON.stringify({ data, sig, address: checksumAddress(account) })
            return PluginSnapshotRPC.vote(body)
        },
        [choices_, identifier, account, proposal],
        () => {
            setLoading(false)
            setOpen(false)
            retry()
        },
        (_err: Error) => setLoading(false),
        void 0,
        messageText(<Trans>Voted.</Trans>),
        messageText(<Trans>Please try again if you failed to vote.</Trans>),
    )

    useRenderPhraseCallbackOnDepsChange(() => setOpen(false), [account, power])

    const onClick = (n: number) => {
        if (proposal.type === 'single-choice') {
            setChoices_((d) => [n])
            return
        }
        if (choices_.includes(n)) setChoices_((d) => d.filter((x) => x !== n))
        else setChoices_((d) => [...d, n])
    }

    const disabled = choices_.length === 0 || !account || !power
    const choiceText = useMemo(() => {
        let text = ''
        for (const i of choices_) {
            text += choices[i - 1]
            if (i < choices_.length) text += ','
        }
        return text
    }, [choices_])
    return account && pluginID === NetworkPluginID.PLUGIN_EVM ?
            <SnapshotCard title={<Trans>Cast your vote</Trans>}>
                <Box className={classes.buttons}>
                    {choices.map((choiceText, i) => (
                        <Button
                            variant="roundedContained"
                            fullWidth
                            key={i}
                            onClick={() => onClick(i + 1)}
                            className={cx([
                                classes.button,
                                classes.choiceButton,
                                ...(choices_.includes(i + 1) ? [classes.buttonActive] : []),
                            ])}>
                            <Typography
                                fontWeight={700}
                                fontSize={16}
                                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {choiceText}
                            </Typography>
                        </Button>
                    ))}

                    <Button
                        variant="roundedContained"
                        fullWidth
                        className={cx(classes.button, disabled ? '' : classes.buttonActive)}
                        disabled={disabled}
                        onClick={() => setOpen(true)}>
                        <Typography fontWeight={700} fontSize={16}>
                            {power && account ?
                                <Trans>Vote</Trans>
                            :   <Trans>No power</Trans>}
                        </Typography>
                    </Button>
                </Box>

                <VoteConfirmDialog
                    open={open}
                    loading={loading}
                    onClose={() => setOpen(false)}
                    choiceText={choiceText}
                    snapshot={proposal.snapshot}
                    powerSymbol={proposal.space.symbol}
                    power={power}
                    onVoteConfirm={onVoteConfirm}
                    chainId={proposal.chainId}
                />
            </SnapshotCard>
        :   null
}
