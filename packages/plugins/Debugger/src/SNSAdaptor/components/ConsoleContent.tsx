import { getEnumAsArray } from '@dimensiondev/kit'
import { PluginId } from '@masknet/plugin-infra'
import {
    useAccount,
    useBalance,
    useBlockNumber,
    useBlockTimestamp,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkType,
    useProviderType,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useSelectAdvancedSettings, useSelectFungibleToken } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { useState } from 'react'

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
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()
    const account = useAccount()
    const chainId = useChainId()
    const networkType = useNetworkType()
    const providerType = useProviderType()
    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const { value: blockTimestamp = 0 } = useBlockTimestamp()

    const onSelectFungibleToken = useSelectFungibleToken()
    const onSelectGasSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

    const [pluginId, setPluginId] = useState<PluginId>(PluginId.RSS3)
    const plugins = getEnumAsArray(PluginId) as Array<{ key: PluginId; value: string }>
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationDialogUpdated)

    const { showSnackbar } = useCustomSnackbar()
    const table: Array<{ name: string; content: JSX.Element }> = [
        {
            name: 'ChainId',
            content: <Typography variant="body2">{chainId}</Typography>,
        },
        {
            name: 'PluginID',
            content: <Typography variant="body2">{pluginID}</Typography>,
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
            name: 'Token List',
            content: (
                <Button
                    size="small"
                    onClick={async () => {
                        const token = await onSelectFungibleToken()
                        console.log(token)
                    }}>
                    Select Fungible Token
                </Button>
            ),
        },
        {
            name: 'Gas Settings',
            content: (
                <Button
                    size="small"
                    onClick={async () => {
                        const gasSettings = await onSelectGasSettings({
                            chainId: ChainId.Matic,
                            slippageTolerance: 1,
                            disableSlippageTolerance: true,
                            transaction: {
                                from: account,
                                to: account,
                                value: '1',
                                gas: 30000,
                                // this field could be overridden with the instant gas options
                                maxFeePerGas: 3800000000,
                            },
                        })
                        console.log(gasSettings)
                    }}>
                    Gas Settings
                </Button>
            ),
        },
        {
            name: 'Test Snackbar',
            content: (
                <Button
                    size="small"
                    onClick={() => {
                        showSnackbar('test', {
                            variant: 'success',
                            message: 'test message',
                            autoHideDuration: 100000000,
                        })
                    }}>
                    show
                </Button>
            ),
        },
        {
            name: 'Open plugin setting',
            content: (
                <>
                    <select onChange={(event) => setPluginId(event.target.value as PluginId)}>
                        {plugins.map((x) => (
                            <option key={x.value} value={x.value}>
                                {x.key}
                            </option>
                        ))}
                    </select>
                    <Button
                        size="small"
                        onClick={() => {
                            setDialog({
                                open: true,
                                settings: {
                                    switchTab: {
                                        focusPluginId: pluginId,
                                    },
                                },
                            })
                        }}>
                        open
                    </Button>
                </>
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
