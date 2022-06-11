import {
    useAccount,
    useBalance,
    useBlockNumber,
    useBlockTimestamp,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useWeb3Connection,
    useWeb3Hub,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, SocialAddress, SocialIdentity, SourceType } from '@masknet/web3-shared-base'
import {
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
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import { FormEvent, useCallback } from 'react'

export interface TabContentProps {
    identity?: SocialIdentity
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function TabContent({ identity, socialAddressList }: TabContentProps) {
    const { classes } = useStyles()

    const renderIdentity = () => {
        return (
            <List dense>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Nickname</Typography>}
                        secondary={identity?.nickname}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Bio</Typography>}
                        secondary={identity?.bio}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Home Page</Typography>}
                        secondary={identity?.homepage}
                    />
                </ListItem>
                <ListItem sx={{ display: 'block' }}>
                    <ListItemText
                        primary={<Typography color="textPrimary">Avatar</Typography>}
                        secondary={<img src={identity?.avatar} style={{ maxWidth: 100 }} />}
                    />
                </ListItem>
            </List>
        )
    }

    const renderAddressNames = () => {
        return (
            <List dense>
                {socialAddressList?.map((x) => (
                    <ListItem key={`${x.type}_${x.address}`}>
                        <ListItemText
                            primary={<Typography color="textPrimary">{x.type}</Typography>}
                            secondary={x.address}
                        />
                    </ListItem>
                ))}
            </List>
        )
    }

    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()
    const connection = useWeb3Connection()
    const hub = useWeb3Hub()
    const account = useAccount()
    const chainId = useChainId()
    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const { value: blockTimestamp = 0 } = useBlockTimestamp()
    const onTransferCallback = useCallback(() => {
        if (!NATIVE_TOKEN_ADDRESS) return
        return connection.transferFungibleToken(
            NATIVE_TOKEN_ADDRESS,
            '0x790116d0685eB197B886DAcAD9C247f785987A4a',
            '100',
        )
    }, [connection])

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
            const signed = await connection.signMessage(type === 'typedDataSign' ? typedData : message, type)
            window.alert(`Signed: ${signed}`)
        },
        [chainId, connection],
    )

    const onSwitchChain = useCallback(
        async (chainId: Web3Helper.ChainIdAll) => {
            return connection?.switchChain?.({
                chainId,
            })
        },
        [connection],
    )

    const onConnect = useCallback(
        async (chainId: Web3Helper.ChainIdAll, providerType: Web3Helper.ProviderTypeAll) => {
            await connection.connect({
                chainId,
                providerType,
            })
        },
        [connection],
    )

    const onDisconnect = useCallback(
        async (providerType: Web3Helper.ProviderTypeAll) => {
            await connection.disconnect({
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
                                                chainId === EVM_ChainId.Mainnet
                                                    ? EVM_ChainId.Matic
                                                    : EVM_ChainId.Mainnet,
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
                                    const token = await connection.getNonFungibleToken(address, tokenId, schemaType)

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
                                onSubmit={async (ev: FormEvent<any>) => {
                                    ev.preventDefault()
                                    const formData = new FormData(ev.currentTarget)
                                    const address = formData.get('address') as string
                                    const tokenId = formData.get('tokenId') as string
                                    const token = await hub.getNonFungibleAsset?.(address, tokenId)
                                    console.log(token)
                                }}>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="address" label="Contract Address" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <TextField name="tokenId" label="Token Id" size="small" />
                                </Box>
                                <Box sx={{ marginBottom: 1 }}>
                                    <RadioGroup defaultValue={SourceType.OpenSea} name="sourceType">
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
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Profile Data
                            </Typography>
                        </TableCell>
                        <TableCell>{renderIdentity()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Found Address Names
                            </Typography>
                        </TableCell>
                        <TableCell>{renderAddressNames()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
