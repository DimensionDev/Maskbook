import { FormEvent, useCallback } from 'react'
import {
    useAccount,
    useBalance,
    useBlockNumber,
    useBlockTimestamp,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkType,
    useProviderType,
    useWeb3Connection,
    useWeb3Hub,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import {
    ChainId,
    ChainId as EVM_ChainId,
    ProviderType as EVM_ProviderType,
    SchemaType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId, ProviderType as SolanaProviderType } from '@masknet/web3-shared-solana'
import { ChainId as FlowChainId, ProviderType as FlowProviderType } from '@masknet/web3-shared-flow'
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import { useSelectFungibleToken, useSelectAdvancedSettings } from '@masknet/shared'

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
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()
    const connection = useWeb3Connection()
    const hub = useWeb3Hub()
    const account = useAccount()
    const chainId = useChainId()
    const networkType = useNetworkType()
    const providerType = useProviderType()
    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const { value: blockTimestamp = 0 } = useBlockTimestamp()

    const onTransferCallback = useCallback(() => {
        if (!NATIVE_TOKEN_ADDRESS) return
        return connection?.transferFungibleToken(
            NATIVE_TOKEN_ADDRESS,
            '0x790116d0685eB197B886DAcAD9C247f785987A4a',
            '100',
        )
    }, [connection])

    const onApproveFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        if (chainId !== ChainId.Mainnet) return
        return connection?.approveFungibleToken(
            '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '1',
        )
    }, [pluginID, connection])

    const onApproveNonFungibleTokenCallback = useCallback(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        if (chainId !== ChainId.Mainnet) return
        return connection?.approveNonFungibleToken(
            '0xd945f759d422ae30a6166838317b937de08380e3',
            '0x31f42841c2db5173425b5223809cf3a38fede360',
            '71050',
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
            const signed = await connection?.signMessage(type === 'typedDataSign' ? typedData : message, type)
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

    const onSelectFungibleToken = useSelectFungibleToken()
    const onSelectGasSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

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
                                Native Token Transfer
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button size="small" onClick={onTransferCallback}>
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
                            <Button size="small" onClick={onApproveNonFungibleTokenCallback}>
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
                                            onSignMessage('personalSign')
                                            break
                                        default:
                                            onSignMessage()
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
                                            onSignMessage('typedDataSign')
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
                                Gas settings
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
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Non-Fungible Token
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <FormControl
                                component="form"
                                onSubmit={async (ev: FormEvent<HTMLFormElement>) => {
                                    ev.preventDefault()
                                    const formData = new FormData(ev.currentTarget)
                                    const address = formData.get('address') as string
                                    const tokenId = formData.get('tokenId') as string
                                    const schemaType = Number.parseInt(
                                        formData.get('schema') as string,
                                        10,
                                    ) as SchemaType
                                    const token = await connection?.getNonFungibleToken(address, tokenId, schemaType)

                                    console.log(token)
                                }}>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="address" label="Contract Address" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="tokenId" label="Token Id" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <RadioGroup defaultValue={SchemaType.ERC721} name="schema">
                                        <FormControlLabel
                                            value={SchemaType.ERC721}
                                            control={<Radio />}
                                            label="ERC721"
                                        />
                                        <FormControlLabel
                                            value={SchemaType.ERC1155}
                                            control={<Radio />}
                                            label="ERC1155"
                                        />
                                    </RadioGroup>
                                </Box>
                                <Button size="small" type="submit">
                                    Query
                                </Button>
                            </FormControl>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Non-Fungible Asset
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <FormControl
                                component="form"
                                onSubmit={async (ev: FormEvent<HTMLFormElement>) => {
                                    ev.preventDefault()
                                    const formData = new FormData(ev.currentTarget)
                                    const address = formData.get('address') as string
                                    const tokenId = formData.get('tokenId') as string
                                    const sourceType = formData.get('sourceType') as SourceType
                                    const token = await hub?.getNonFungibleAsset?.(address, tokenId, {
                                        sourceType,
                                    })
                                    console.log(token)
                                }}>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="address" label="Contract Address" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="tokenId" label="Token Id" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <RadioGroup defaultValue={SourceType.Alchemy_EVM} name="sourceType">
                                        <FormControlLabel
                                            value={SourceType.Alchemy_EVM}
                                            control={<Radio />}
                                            label="Alchemy"
                                        />
                                        <FormControlLabel
                                            value={SourceType.OpenSea}
                                            control={<Radio />}
                                            label="OpenSea"
                                        />
                                        <FormControlLabel
                                            value={SourceType.Rarible}
                                            control={<Radio />}
                                            label="Rarible"
                                        />
                                        <FormControlLabel value={SourceType.RSS3} control={<Radio />} label="RSS3" />
                                        <FormControlLabel value={SourceType.Zora} control={<Radio />} label="Zora" />
                                        <FormControlLabel
                                            value={SourceType.NFTScan}
                                            control={<Radio />}
                                            label="NFTScan"
                                        />
                                    </RadioGroup>
                                </Box>
                                <Button size="small" type="submit">
                                    Query
                                </Button>
                            </FormControl>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Test Snackbar</TableCell>
                        <TableCell>
                            <Button
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
                </TableBody>
            </Table>
        </section>
    )
}
