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

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                ChainId
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{chainId}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                PluginID
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{pluginID}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Network Type
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{networkType}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Provider Type
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{providerType}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Account
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{Others?.formatAddress(account, 4)}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Balance
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{balance}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Block Number
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{blockNumber}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Block Timestamp
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{blockTimestamp}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Token List
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={async () => {
                                    const token = await onSelectFungibleToken()
                                    console.log(token)
                                }}>
                                Select Fungible Token
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Gas Settings
                            </Typography>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Test Snackbar</TableCell>
                        <TableCell>
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
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Open plugin setting</TableCell>
                        <TableCell>
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
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
