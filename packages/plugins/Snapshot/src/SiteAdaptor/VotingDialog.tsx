import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { InjectedDialog, PluginWalletStatusBar, useSnackbarCallback, WalletConnectedBoundary } from '@masknet/shared'
import { EMPTY_LIST, formatWithCommas, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { formatCount } from '@masknet/web3-shared-base'
import { checksumAddress } from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { unstable_useCacheRefresh, useContext, useMemo, useState } from 'react'
import { SNAPSHOT_VOTE_DOMAIN } from '../constants.js'
import { SnapshotContext } from '../context.js'
import { PluginSnapshotRPC } from '../messages.js'
import { formatChoice, getSnapshotVoteTypes } from '../utils.js'
import { InfoField } from './InformationCard.js'
import { SnapshotCard } from './SnapshotCard.js'
import { usePower } from './hooks/usePower.js'
import { useProposal } from './hooks/useProposal.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        margin: 0,
    },
    link: {
        display: 'flex',
        color: 'inherit',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        textDecoration: 'none !important',
    },
    field: {
        color: theme.palette.maskColor.second,
        margin: '0',
    },
    value: {
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    content: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        height: 492,
        alignItems: 'stretch',
    },
    button: {
        margin: theme.spacing(2),
    },
    options: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    optionButton: {
        backgroundColor: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    selectedOption: {
        backgroundColor: `${theme.palette.maskColor.main} !important`,
        color: `${theme.palette.maskColor.bottom} !important`,
    },
    tip: {
        padding: theme.spacing(2),
        borderRadius: 16,
        border: `1px solid ${theme.palette.maskColor.line}`,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        '& a': {
            color: theme.palette.maskColor.main,
            textDecoration: 'underline',
        },
    },
}))

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

interface VotingDialogProps {
    open: boolean
    onClose: () => void
}

export function VotingDialog({ open, onClose }: VotingDialogProps) {
    const { classes, cx } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const choices = proposal.choices
    const { data: power } = usePower(identifier)
    const powerSymbol = proposal.space.symbol
    const snapshot = proposal.snapshot
    const [selected, setSelected] = useState<string[]>([])
    const selectedIndexes = useMemo(() => {
        return selected.map((x) => proposal.choices.indexOf(x) + 1)
    }, [selected, proposal.choices])

    const disabled = selected.length === 0 || !account || !power
    const onToggle = (n: string) => {
        if (proposal.type === 'single-choice') {
            setSelected([n])
            return
        }
        if (selected.includes(n)) setSelected((l) => l.filter((x) => x !== n))
        else setSelected((d) => [...d, n])
    }

    const [loading, setLoading] = useState(false)
    const retry = unstable_useCacheRefresh()
    const { showSnackbar } = useCustomSnackbar()
    const queryClient = useQueryClient()
    const onVoteConfirm = useSnackbarCallback(
        async () => {
            setLoading(true)
            const isType2 = identifier.id.startsWith('0x')
            const types = {
                ...getSnapshotVoteTypes(proposal.type, identifier.id, proposal.privacy),
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                ],
            }
            const choiceType = types.Vote.find((x) => x.name === 'choice')!.type
            const choice = formatChoice(choiceType, selectedIndexes)
            const message = {
                from: checksumAddress(account),
                space: proposal.space.id,
                timestamp: Math.floor(Date.now() / 1000),
                proposal: identifier.id,
                choice,
                metadata: '{}',
                reason: '',
                app: isType2 ? 'snapshot-v2' : 'snapshot',
            }
            const domain = SNAPSHOT_VOTE_DOMAIN
            showSnackbar(<Trans>Vote</Trans>, {
                message: <Trans>Confirm this Signature in your wallet.</Trans>,
                autoHideDuration: 3_000,
            })
            const sig = await EVMWeb3.signMessage(
                'typedData',
                JSON.stringify({
                    domain,
                    primaryType: 'Vote',
                    message,
                    types,
                }),
                { account: checksumAddress(account) },
            )
            const body = JSON.stringify({
                address: checksumAddress(account),
                sig,
                data: {
                    message,
                    domain,
                    types,
                },
            })
            const result = await PluginSnapshotRPC.vote(body, sig === '0x')
            if ('error' in result) {
                throw new Error(result.error)
            }
            setSelected(EMPTY_LIST)
            queryClient.invalidateQueries({ queryKey: ['snapshot', 'proposal', identifier.id] })
            return result
        },
        [selectedIndexes, identifier, account, proposal],
        () => {
            setLoading(false)
            onClose()
            retry()
        },
        (_err: Error) => setLoading(false),
        void 0,
        messageText(<Trans>Your vote has been successful.</Trans>),
        messageText(<Trans>Please try again if you failed to vote.</Trans>),
    )
    const link = `https://snapshot.box/#/${identifier.space}/proposal/${identifier.id}`

    return (
        <InjectedDialog open={open} onClose={onClose} title={<Trans>Cast your vote</Trans>}>
            <DialogContent className={classes.content}>
                <SnapshotCard title={<Trans>Cast your vote</Trans>} className={classes.card}>
                    <Box className={classes.options}>
                        {choices.map((option) => (
                            <Button
                                variant="roundedContained"
                                fullWidth
                                key={option}
                                disabled={loading}
                                onClick={() => onToggle(option)}
                                className={cx(
                                    classes.optionButton,
                                    selected.includes(option) ? classes.selectedOption : null,
                                )}>
                                <Typography
                                    fontWeight={700}
                                    fontSize={16}
                                    sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {option}
                                </Typography>
                            </Button>
                        ))}
                    </Box>
                </SnapshotCard>
                <InfoField classes={{ field: classes.field }} title={<Trans>Snapshot</Trans>}>
                    <Link className={cx(classes.link, classes.value)} target="_blank" rel="noopener" href={link}>
                        {formatWithCommas(snapshot)}
                        <Icons.LinkOut sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={<Trans>Your voting power</Trans>}>
                    <Typography className={classes.value}>
                        {power !== undefined ? formatCount(power, 2, true) : '--'} {powerSymbol.toUpperCase()}
                    </Typography>
                </InfoField>
                {!power ?
                    <Typography className={classes.tip}>
                        <Trans>
                            Oops, it seems you don't have any voting power at block {formatWithCommas(snapshot)}.{' '}
                            <Link
                                href="https://github.com/snapshot-labs/snapshot-v1/discussions/767"
                                target="_blank"
                                rel="noopener"
                                title={t`Why I can't vote?`}>
                                Learn more
                            </Link>
                        </Trans>
                    </Typography>
                :   null}
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <WalletConnectedBoundary offChain classes={{ button: classes.button }} expectedChainId={chainId}>
                    <PluginWalletStatusBar>
                        <ActionButton
                            color="primary"
                            fullWidth
                            disabled={loading || disabled}
                            onClick={onVoteConfirm}
                            loading={loading}>
                            {power && account ?
                                <Trans>Vote</Trans>
                            :   <Trans>No power</Trans>}
                        </ActionButton>
                    </PluginWalletStatusBar>
                </WalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
