import { useCallback } from 'react'
import type { AbiItem } from 'web3-utils'
import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3Connection, useChainContext, useNetworkContext, useWeb3 } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useTelemetry } from '@masknet/web3-telemetry/hooks'
import { NetworkPluginID, ProofType } from '@masknet/shared-base'
import {
    type Web3,
    ChainId,
    ChainId as EVM_ChainId,
    ProviderType as EVM_ProviderType,
    createContract,
} from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId, ProviderType as SolanaProviderType } from '@masknet/web3-shared-solana'
import { ChainId as FlowChainId, ProviderType as FlowProviderType } from '@masknet/web3-shared-flow'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import { TelemetryAPI } from '@masknet/web3-providers/types'

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
    const web3 = useWeb3()
    const connection = useWeb3Connection()
    const telemetry = useTelemetry()

    const onCaptureEvent = useCallback(async () => {
        telemetry.captureEvent(TelemetryAPI.EventType.Debug, TelemetryAPI.EventID.Debug)
    }, [telemetry])

    const onCaptureException = useCallback(async () => {
        telemetry.captureException(
            TelemetryAPI.ExceptionType.Error,
            TelemetryAPI.ExceptionID.Debug,
            new Error('An error message.'),
        )
    }, [telemetry])

    const onEstimateCallback = useCallback(async () => {
        const contract = createContract<ERC20>(
            web3 as Web3,
            '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
            ERC20ABI as AbiItem[],
        )
        const estimatedGas = await connection?.estimateTransaction?.(
            {
                from: '0xfBFc40D6E771880DDA2c7285817c8A93Fc4F1D2F',
                to: '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
                value: '1',
                data: contract?.methods.approve('0x31f42841c2db5173425b5223809cf3a38fede360', '1').encodeABI(),
            },
            0,
            {
                chainId: ChainId.Matic,
                account: '0xfBFc40D6E771880DDA2c7285817c8A93Fc4F1D2F',
                providerType: EVM_ProviderType.MaskWallet,
                paymentToken: '0xfBFc40D6E771880DDA2c7285817c8A93Fc4F1D2F',
                overrides: {
                    gas: '88888',
                    maxFeePerGas: '88888',
                    maxPriorityFeePerGas: '88888',
                },
            },
        )
        window.alert(estimatedGas)
    }, [web3, connection])

    const onTransferCallback = useCallback(() => {
        return connection?.transferFungibleToken?.(
            '0x0000000000000000000000000000000000000000',
            '0x96ec3286a049b42133c3ddd26777051612bdf61f',
            '100',
            undefined,
            {
                chainId,
                account,
            },
        )
    }, [connection])

    const onDeployCallback = useCallback(() => {
        return connection?.deploy?.('0x790116d0685eB197B886DAcAD9C247f785987A4a', undefined, {
            chainId: ChainId.Matic,
            account: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
            providerType: EVM_ProviderType.MaskWallet,
        })
    }, [connection])

    const onFundCallback = useCallback(() => {
        return connection?.fund?.(
            {
                publicKey: '',
                type: ProofType.Persona,
                payload: JSON.stringify({
                    ownerAddress: '0x96ec3286a049b42133c3ddd26777051612bdf61f',
                    nonce: 0,
                }),
                signature: '',
            },
            {
                chainId: ChainId.Matic,
                account: '0x96ec3286a049b42133c3ddd26777051612bdf61f',
                providerType: EVM_ProviderType.MaskWallet,
            },
        )
    }, [connection])

    const onChangeOwnerChange = useCallback(() => {
        return connection?.changeOwner?.('0x66b57885E8E9D84742faBda0cE6E3496055b012d', {
            chainId: ChainId.Matic,
            account: '0x96ec3286a049b42133c3ddd26777051612bdf61f',
            providerType: EVM_ProviderType.MaskWallet,
        })
    }, [connection])

    const onApproveFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        return connection?.approveFungibleToken(
            '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '1',
            {
                chainId: ChainId.Matic,
                account: '0xfBFc40D6E771880DDA2c7285817c8A93Fc4F1D2F',
                providerType: EVM_ProviderType.MaskWallet,
                paymentToken: '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
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

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Capture Event
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onCaptureEvent()}>
                                Capture Event
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Capture Exception
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onCaptureException()}>
                                Capture Exception
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Estimate
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onEstimateCallback()}>
                                Estimate
                            </Button>
                        </TableCell>
                    </TableRow>
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
