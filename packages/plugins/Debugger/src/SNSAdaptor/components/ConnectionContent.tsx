import { useCallback } from 'react'
import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3Connection, useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    ChainId,
    ChainId as EVM_ChainId,
    ProviderType as EVM_ProviderType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId, ProviderType as SolanaProviderType } from '@masknet/web3-shared-solana'
import { ChainId as FlowChainId, ProviderType as FlowProviderType } from '@masknet/web3-shared-flow'

export interface ConnectionContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function ConnectionContent(props: ConnectionContentProps) {
    const { classes } = useStyles()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const connection = useWeb3Connection()

    const onTransferCallback = useCallback(() => {
        if (!NATIVE_TOKEN_ADDRESS) return
        return connection?.transferFungibleToken(
            NATIVE_TOKEN_ADDRESS,
            '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
            '100',
            undefined,
            {
                chainId: ChainId.Mumbai,
                account: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                providerType: EVM_ProviderType.MaskWallet,
                overrides: {
                    chainId: ChainId.Mumbai,
                    from: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                },
            },
        )
    }, [connection])

    const onApproveFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        if (chainId !== ChainId.Mainnet) return
        return connection?.approveFungibleToken(
            '0xF8935Df67cAB7BfcA9532D1Ac2088C5c39b995b5',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '1',
            {
                chainId: ChainId.Mumbai,
                account: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                providerType: EVM_ProviderType.MaskWallet,
                overrides: {
                    chainId: ChainId.Mumbai,
                    from: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                },
            },
        )
    }, [pluginID, connection])

    const onSignMessage = useCallback(
        async (type?: string) => {
            const message = 'Hello World'
            const typedData = JSON.stringify({
                domain: {
                    chainId: chainId.toString(),
                    name: 'Ether Mail',
                    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                    version: '1',
                },
                message: {
                    contents: 'Hello, Bob!',
                    from: {
                        name: 'Cow',
                        wallets: [
                            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
                            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
                        ],
                    },
                    to: [
                        {
                            name: 'Bob',
                            wallets: [
                                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                                '0xB0B0b0b0b0b0B000000000000000000000000000',
                            ],
                        },
                    ],
                },
                primaryType: 'Mail',
                types: {
                    Group: [
                        { name: 'name', type: 'string' },
                        { name: 'members', type: 'Person[]' },
                    ],
                    Mail: [
                        { name: 'from', type: 'Person' },
                        { name: 'to', type: 'Person[]' },
                        { name: 'contents', type: 'string' },
                    ],
                    Person: [
                        { name: 'name', type: 'string' },
                        { name: 'wallets', type: 'address[]' },
                    ],
                },
            })
            const signed = await connection?.signMessage(type ?? message, type === 'typedData' ? typedData : message)
            window.alert(`Signed: ${signed}`)
        },
        [chainId, connection],
    )

    const onSwitchChain = useCallback(
        async (chainId: Web3Helper.ChainIdAll) => {
            return connection?.switchChain?.(chainId)
        },
        [connection],
    )

    const onConnect = useCallback(
        async (chainId: Web3Helper.ChainIdAll, providerType: Web3Helper.ProviderTypeAll) => {
            await connection?.connect({
                chainId,
                providerType,
            })
        },
        [connection],
    )

    const onDisconnect = useCallback(
        async (providerType: Web3Helper.ProviderTypeAll) => {
            await connection?.disconnect({
                providerType,
            })
        },
        [connection],
    )

    if (!account) {
        return (
            <section className={classes.container}>
                <Typography>Please connect a wallet.</Typography>
            </section>
        )
    }

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Native Token Transfer
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onTransferCallback()}>
                                Transfer
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Approve Fungible Token
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={onApproveFungibleTokenCallback}>
                                Approve
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Approve Non-Fungible Token
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={onApproveFungibleTokenCallback}>
                                Approve
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Sign Message
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={() => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            onSignMessage('message')
                                            break
                                        default:
                                            onSignMessage('message')
                                            break
                                    }
                                }}>
                                Sign Message
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Sign Typed Data
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={() => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            onSignMessage('typedData')
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Sign Typed Data
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Switch Chain
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={async () => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            await onSwitchChain(
                                                chainId === EVM_ChainId.Mainnet ? EVM_ChainId.BSC : EVM_ChainId.Mainnet,
                                            )
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Switch Chain
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Connect Wallet
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={async () => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            await onConnect(EVM_ChainId.Mainnet, EVM_ProviderType.MetaMask)
                                            break
                                        case NetworkPluginID.PLUGIN_SOLANA:
                                            await onConnect(SolanaChainId.Mainnet, SolanaProviderType.Phantom)
                                            break
                                        case NetworkPluginID.PLUGIN_FLOW:
                                            await onConnect(FlowChainId.Mainnet, FlowProviderType.Blocto)
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Connect
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Disconnect Wallet
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={async () => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            await onDisconnect(EVM_ProviderType.MetaMask)
                                            break
                                        case NetworkPluginID.PLUGIN_SOLANA:
                                            await onDisconnect(SolanaProviderType.Phantom)
                                            break
                                        case NetworkPluginID.PLUGIN_FLOW:
                                            await onDisconnect(FlowProviderType.Blocto)
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Disconnect
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
