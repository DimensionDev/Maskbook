import { Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import {
    useBalance,
    useBlockNumber,
    useBlockTimestamp,
    useNetworkContext,
    useReverseAddress,
    useLookupAddress,
    useWeb3State,
    useChainContext,
} from '@masknet/web3-hooks-base'
import { makeStyles } from '@masknet/theme'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra'

export interface ConsoleContentProps {
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
    const { Others } = useWeb3State()
    const { account, chainId, networkType, providerType } = useChainContext()
    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const { value: blockTimestamp = 0 } = useBlockTimestamp()
    const { value: reversedName } = useReverseAddress(currentPluginID, account)
    const { value: lookedAddress } = useLookupAddress(currentPluginID, reversedName)
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    const table: Array<{ name: string; content: JSX.Element }> = [
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
            name: 'Account',
            content: <Typography variant="body2">{Others?.formatAddress(account, 4)}</Typography>,
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
            name: 'Current Visiting Identity',
            content: (
                <Typography variant="body2">
                    {currentVisitingIdentity?.identifier?.userId} {currentVisitingIdentity?.isOwner ? 'OWNER' : ''}
                </Typography>
            ),
        },
        {
            name: 'Last Regconized Identity',
            content: (
                <Typography variant="body2">
                    {lastRecognizedIdentity?.identifier?.userId} {lastRecognizedIdentity?.isOwner ? 'OWNER' : ''}
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
