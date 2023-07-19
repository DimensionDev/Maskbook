import { useCallback, useMemo } from 'react'
import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Web3, Contract } from '@masknet/web3-providers'
import { NetworkPluginID, ProofType } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType, createNativeToken } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useNetworks, useTelemetry, useWeb3State } from '@masknet/web3-hooks-base'
import { EventType, EventID, ExceptionType, ExceptionID } from '@masknet/web3-telemetry/types'

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
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const telemetry = useTelemetry()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const customNetwork = useMemo(() => {
        return networks.find((x) => x.type === NetworkType.CustomNetwork)
    }, [networks])

    const onAddNetwork = useCallback(async () => {
        await Network?.addNetwork({
            type: NetworkType.CustomNetwork,
            chainId: ChainId.Mainnet,
            coinMarketCapChainId: '',
            coinGeckoChainId: '',
            coinGeckoPlatformId: '',
            name: 'Mainnet',
            network: 'mainnet',
            nativeCurrency: createNativeToken(ChainId.Mainnet),
            rpcUrl: 'https://mainnet.infura.io/v3/659123dd11294baf8a294d7a11cec92c',
            explorerUrl: {
                url: 'https://etherscan.io/',
            },
            isCustomized: true,
        })
    }, [Network])

    const onRemoveNetwork = useCallback(async () => {
        if (!customNetwork) return
        await Network?.removeNetwork(customNetwork.ID)
    }, [customNetwork, Network])

    const onRenameNetwork = useCallback(async () => {
        if (!customNetwork) return
        await Network?.updateNetwork(customNetwork.ID, {
            name: 'Ethereum Mainnet',
        })
    }, [customNetwork, Network])

    const onCaptureEvent = useCallback(async () => {
        telemetry.captureEvent(EventType.Debug, EventID.Debug)
    }, [telemetry])

    const onCaptureException = useCallback(async () => {
        telemetry.captureException(ExceptionType.Error, ExceptionID.Debug, new Error(`An error message ${Date.now()}.`))
    }, [telemetry])

    const onEstimateCallback = useCallback(async () => {
        const contract = Contract.getERC20Contract('0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7', {
            chainId: ChainId.Mainnet,
        })
        const estimatedGas = await Web3.estimateTransaction?.(
            {
                from: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                to: '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
                value: '1',
                data: contract?.methods.approve('0x31f42841c2db5173425b5223809cf3a38fede360', '1').encodeABI(),
            },
            0,
            {
                chainId: ChainId.Mainnet,
                account: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',

                paymentToken: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                overrides: {
                    gas: '88888',
                    maxFeePerGas: '88888',
                    maxPriorityFeePerGas: '88888',
                },
            },
        )

        // eslint-disable-next-line no-alert
        alert(estimatedGas)
    }, [])

    const onTransferCallback = useCallback(() => {
        return Web3.transferFungibleToken(
            '0x0000000000000000000000000000000000000000',
            '0x96ec3286a049b42133c3ddd26777051612bdf61f',
            '100',
            undefined,
            {
                chainId,
                account,
            },
        )
    }, [])

    const onDeployCallback = useCallback(() => {
        return Web3.deploy?.('0x790116d0685eB197B886DAcAD9C247f785987A4a', undefined, {
            chainId: ChainId.Matic,
            account: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        })
    }, [])

    const onFundCallback = useCallback(() => {
        return Web3.fund?.(
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
            },
        )
    }, [])

    const onChangeOwnerChange = useCallback(() => {
        return Web3.changeOwner?.('0x66b57885E8E9D84742faBda0cE6E3496055b012d', {
            chainId: ChainId.Matic,
            account: '0x96ec3286a049b42133c3ddd26777051612bdf61f',
        })
    }, [])

    const onApproveFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        return Web3.approveFungibleToken(
            '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '1',
            {
                chainId: ChainId.Matic,
                account: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                paymentToken: '0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7',
            },
        )
    }, [pluginID])

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
                        return Web3.signMessage('message', message)
                    case 'typedData':
                        return Web3.signMessage('typedData', typedData)
                    case 'transaction':
                        return Web3.signTransaction(transaction)
                    default:
                        return ''
                }
            }
            // eslint-disable-next-line no-alert
            alert(`Signed: ${await sign()}`)
        },
        [chainId],
    )

    const onSwitchChain = useCallback(async (chainId: ChainId) => {
        return Web3.switchChain?.(chainId)
    }, [])

    const onConnect = useCallback(async (chainId: ChainId, providerType: ProviderType) => {
        await Web3.connect({
            chainId,
            providerType,
        })
    }, [])

    const onDisconnect = useCallback(async (providerType: ProviderType) => {
        await Web3.disconnect({
            providerType,
        })
    }, [])

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Add Custom Network
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={() => onAddNetwork()}>
                                Add Network
                            </Button>
                        </TableCell>
                    </TableRow>
                    {customNetwork ? (
                        <>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        Remove Custom Network
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => onRemoveNetwork()}>
                                        Remove {customNetwork.name}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        Rename Custom Network
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => onRenameNetwork()}>
                                        Rename {customNetwork.name}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </>
                    ) : null}
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
                                                chainId === ChainId.Mainnet ? ChainId.Matic : ChainId.Mainnet,
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
                                            await onConnect(ChainId.Mainnet, ProviderType.MetaMask)
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
                                            await onDisconnect(ProviderType.MetaMask)
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
