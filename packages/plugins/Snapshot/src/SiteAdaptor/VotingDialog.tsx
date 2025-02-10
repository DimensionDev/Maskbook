import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { InjectedDialog, PluginWalletStatusBar, useSnackbarCallback, WalletConnectedBoundary } from '@masknet/shared'
import { formatWithCommas, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import { formatCount } from '@masknet/web3-shared-base'
import { checksumAddress } from '@masknet/web3-shared-evm'
import { OpenInNew } from '@mui/icons-material'
import { Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { unstable_useCacheRefresh, useContext, useState } from 'react'
import { SNAPSHOT_VOTE_DOMAIN } from '../constants.js'
import { SnapshotContext } from '../context.js'
import { PluginSnapshotRPC } from '../messages.js'
import { getSnapshotVoteType } from '../utils.js'
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
        backgroundColor: theme.palette.maskColor.third,
        color: theme.palette.maskColor.main,
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    selectedOption: {
        backgroundColor: `${theme.palette.maskColor.publicMain} !important`,
        color: `${theme.palette.maskColor.white} !important`,
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
    const onVoteConfirm = useSnackbarCallback(
        async () => {
            setLoading(true)
            const message = {
                from: checksumAddress(account),
                space: proposal.space,
                timestamp: Math.floor(Date.now() / 1000),
                proposal: identifier.id,
                choice: proposal.type === 'single-choice' ? selected[0] : selected,
                metadata: JSON.stringify({}),
            }
            const domain = SNAPSHOT_VOTE_DOMAIN
            const types = getSnapshotVoteType(proposal.type)
            const data = {
                message,
                domain,
                types,
            }
            showSnackbar(<Trans>Vote</Trans>, {
                message: <Trans>Confirm this Signature in your wallet.</Trans>,
                autoHideDuration: 3_000,
            })
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
        [selected, identifier, account, proposal],
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
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={EVMExplorerResolver.blockLink(chainId, Number.parseInt(snapshot, 10))}>
                        {formatWithCommas(snapshot)}
                        <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={<Trans>Your voting power</Trans>}>
                    <Typography>
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
