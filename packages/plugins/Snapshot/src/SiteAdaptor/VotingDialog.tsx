import { Trans } from '@lingui/react/macro'
import { InjectedDialog, PluginWalletStatusBar, useSnackbarCallback, WalletConnectedBoundary } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import { formatCount } from '@masknet/web3-shared-base'
import { checksumAddress } from '@masknet/web3-shared-evm'
import { OpenInNew } from '@mui/icons-material'
import { Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { unstable_useCacheRefresh, useContext, useState } from 'react'
import { SNAPSHOT_VOTE_DOMAIN } from '../constants.js'
import { PluginSnapshotRPC } from '../messages.js'
import { getSnapshotVoteType } from '../utils.js'
import { InfoField } from './InformationCard.js'
import { SnapshotCard } from './SnapshotCard.js'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotContext } from '../context.js'
import { usePower } from './hooks/usePower.js'

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
        margin: theme.spacing(2, 0),
    },
    choiceButton: {
        backgroundColor: theme.palette.maskColor.third,
        color: theme.palette.maskColor.main,
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
    const power = usePower(identifier)
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
        messageText(<Trans>Voted.</Trans>),
        messageText(<Trans>Please try again if you failed to vote.</Trans>),
    )
    return (
        <InjectedDialog open={open} onClose={onClose} title={<Trans>Cast your vote</Trans>}>
            <DialogContent className={classes.content}>
                <SnapshotCard title={<Trans>Cast your vote</Trans>}>
                    <Box className={classes.buttons}>
                        {choices.map((choiceText, i) => (
                            <Button
                                variant="roundedContained"
                                fullWidth
                                key={i}
                                onClick={() => onToggle(choiceText)}
                                className={cx([
                                    classes.button,
                                    classes.choiceButton,
                                    ...(selected.includes(choiceText) ? [classes.buttonActive] : []),
                                ])}>
                                <Typography
                                    fontWeight={700}
                                    fontSize={16}
                                    sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {choiceText}
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
                        {snapshot}
                        <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
                <InfoField classes={{ field: classes.field }} title={<Trans>Your voting power</Trans>}>
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
