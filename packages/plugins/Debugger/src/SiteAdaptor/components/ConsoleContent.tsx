import { Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    useBalance,
    useBlockNumber,
    useBlockTimestamp,
    useNetworkContext,
    useReverseAddress,
    useLookupAddress,
    useWeb3Utils,
    useChainContext,
} from '@masknet/web3-hooks-base'
import {
    useLastRecognizedIdentity,
    useCurrentVisitingIdentity,
    useCurrentVisitingSocialIdentity,
} from '@masknet/plugin-infra/content-script'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { joinsABTest } from '@masknet/web3-telemetry/helpers'
import type { JSX } from 'react'
interface ConsoleContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function ConsoleContent(props: ConsoleContentProps) {
    const { classes } = useStyles()
    const { pluginID: currentPluginID } = useNetworkContext()
    const Utils = useWeb3Utils()
    const { account, chainId, networkType, providerType } = useChainContext()
    const { data: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const { value: blockTimestamp = 0 } = useBlockTimestamp()
    const { data: reversedName } = useReverseAddress(currentPluginID, account)
    const { value: lookedAddress } = useLookupAddress(currentPluginID, reversedName)
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const currentVisitingSocialIdentity = useCurrentVisitingSocialIdentity()

    useRemoteControlledDialog(CrossIsolationMessages.events.followLensDialogEvent)

    const table: Array<{ name: string; content: JSX.Element }> = [
        {
            name: 'A/B Testing',
            content: <Typography variant="body2">{joinsABTest() ? 'A' : 'B'}</Typography>,
        },
        {
            name: 'Account',
            content: <Typography variant="body2">{Utils.formatAddress(account, 4) || 'Not Connected'}</Typography>,
        },
        {
            name: 'ChainId',
            content: <Typography variant="body2">{chainId}</Typography>,
        },
        {
            name: 'PluginID',
            content: <Typography variant="body2">{currentPluginID}</Typography>,
        },
        {
            name: 'Network Type',
            content: <Typography variant="body2">{networkType}</Typography>,
        },
        {
            name: 'Provider Type',
            content: <Typography variant="body2">{providerType}</Typography>,
        },
        {
            name: 'Balance',
            content: <Typography variant="body2">{balance}</Typography>,
        },
        {
            name: 'Block Number',
            content: <Typography variant="body2">{blockNumber}</Typography>,
        },
        {
            name: 'Block Timestamp',
            content: <Typography variant="body2">{blockTimestamp}</Typography>,
        },
        {
            name: 'Reversed Name',
            content: <Typography variant="body2">{reversedName}</Typography>,
        },
        {
            name: 'Looked Address',
            content: <Typography variant="body2">{lookedAddress}</Typography>,
        },
        {
            name: 'Visiting Identity',
            content: (
                <Typography variant="body2">
                    {currentVisitingIdentity?.identifier?.userId} {currentVisitingIdentity?.isOwner ? 'OWNER' : ''}
                </Typography>
            ),
        },
        {
            name: 'Owner Identity',
            content: (
                <Typography variant="body2">
                    {lastRecognizedIdentity?.identifier?.userId} {lastRecognizedIdentity?.isOwner ? 'OWNER' : ''}
                </Typography>
            ),
        },
        {
            name: 'Visiting Public Key',
            content: (
                <Typography variant="body2" style={{ width: 280, wordBreak: 'break-all' }}>
                    {currentVisitingSocialIdentity.data?.publicKey}
                </Typography>
            ),
        },
    ]

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    {table.map(({ name, content }) => (
                        <TableRow key={name}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{content}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    )
}
