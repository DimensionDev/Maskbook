import { useCallback } from 'react'
import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3Connection, useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, ProofType } from '@masknet/shared-base'
import { ChainId, ChainId as EVM_ChainId, ProviderType as EVM_ProviderType } from '@masknet/web3-shared-evm'
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
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const connection = useWeb3Connection()

    const onTransferCallback = useCallback(() => {
        return connection?.transferFungibleToken?.(
            '0x0000000000000000000000000000000000000000',
            '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
            '100',
            undefined,
            {
                chainId,
                account,
            },
        )
    }, [connection])

    const onDeployCallback = useCallback(() => {
        return connection?.deploy?.('0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC', undefined, {
            chainId: ChainId.Matic,
            account: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
            providerType: EVM_ProviderType.MaskWallet,
        })
    }, [connection])

    const onFundCallback = useCallback(() => {
        return connection?.fund?.(
            {
                publicKey: '',
                type: ProofType.Persona,
                payload: JSON.stringify({
                    ownerAddress: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                    nonce: 0,
                }),
                signature: '',
            },
            {
                chainId: ChainId.Matic,
                account: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
                providerType: EVM_ProviderType.MaskWallet,
            },
        )
    }, [connection])

    const onChangeOwnerChange = useCallback(() => {
        return connection?.changeOwner?.('0x66b57885E8E9D84742faBda0cE6E3496055b012d', {
            chainId: ChainId.Matic,
            account: '0xDCA2d88dfd48F40927B6ACAA6538c1C999fF9eFC',
            providerType: EVM_ProviderType.MaskWallet,
        })
    }, [connection])

    const onApproveFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        return connection?.approveFungibleToken(
            '0xF8935Df67cAB7BfcA9532D1Ac2088C5c39b995b5',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '1',
            {
                chainId: ChainId.Matic,
                account: '0xF8935Df67cAB7BfcA9532D1Ac2088C5c39b995b5',
                providerType: EVM_ProviderType.MaskWallet,
            },
        )
    }, [pluginID, connection])

    const onSign = useCallback(
        async (type: string) => {
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
            const transaction = {
                chainId: ChainId.Mainnet,
                from: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                to: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                value: '0x1000',
                gas: '0x5208',
                gasPrice: '0x174876e800',
                nonce: 0,
                data: '0x',
            }

            const sign = async () => {
                switch (type) {
                    case 'message':
                        return connection?.signMessage('message', message)
                    case 'typedData':
                        return connection?.signMessage('typedData', typedData)
                    case 'transaction':
                        return connection?.signTransaction(transaction)
                    default:
                        return ''
                }
            }

            window.alert(`Signed: ${await sign()}`)
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
                                Transfer
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
                                Deploy
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onDeployCallback()}>
                                Deploy
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Fund
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onFundCallback()}>
                                Fund
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Change Owner
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onChangeOwnerChange()}>
                                Change Owner
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
                                            onSign('message')
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Sign
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
                                            onSign('typedData')
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Sign
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Sign Transaction
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={() => {
                                    switch (pluginID) {
                                        case NetworkPluginID.PLUGIN_EVM:
                                            onSign('transaction')
                                            break
                                        default:
                                            break
                                    }
                                }}>
                                Sign
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
