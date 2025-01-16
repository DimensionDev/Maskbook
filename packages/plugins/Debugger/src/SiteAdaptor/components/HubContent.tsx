import { useState } from 'react'
import { Icons } from '@masknet/icons'
import { getEnumAsArray } from '@masknet/kit'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Hub } from '@masknet/web3-providers/types'
import { getHub } from '@masknet/web3-providers'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { OrderSide, resolveSourceTypeName, SourceType } from '@masknet/web3-shared-base'
import { Button, MenuItem, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { SelectFungibleTokenModal } from '@masknet/shared'

interface HubContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function HubContent(props: HubContentProps) {
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const [keyword, setKeyword] = useState('PUNK')
    const [address, setAddress] = useState('0x932261f9fc8da46c4a22e31b45c4de60623848bf')
    const [tokenId, setTokenId] = useState('32342')
    const [sourceType, setSourceType] = useState<SourceType>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    type HubAll = Required<Hub<NetworkPluginID>>
    type API<T extends keyof HubAll = keyof HubAll> = readonly [T, Parameters<HubAll[T]>]

    const APIs: API[] = [
        // gas options
        ['getGasOptions', [chainId]],

        // transactions
        ['getTransactions', [chainId, account]],

        // fungible tokens
        ['getFungibleToken', [address]],
        ['getFungibleAsset', [address]],
        ['getFungibleAssets', [account]],
        ['getFungibleTokenPrice', [chainId, address]],

        ['getFungibleTokenIconURLs', [chainId, address]],

        ['getFungibleTokensFromTokenList', [chainId]],
        ['getFungibleTokenSpenders', [chainId, account]],

        // non-fungible tokens
        ['getNonFungibleTokensFromTokenList', [chainId]],
        ['getNonFungibleTokenSpenders', [chainId, address]],
        ['getNonFungibleTokenContract', [address]],
        ['getNonFungibleCollectionsByOwner', [account]],
        ['getNonFungibleTokenEvents', [address, tokenId]],
        ['getNonFungibleTokenOrders', [address, tokenId, OrderSide.Buy]],
        ['getNonFungibleAsset', [address, tokenId]],
        ['getNonFungibleAssets', [account]],
        ['getNonFungibleRarity', [address, tokenId]],
        ['getNonFungibleAssetsByCollection', [address]],
    ]

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Keyword
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Keyword"
                                value={keyword}
                                placeholder="Enter keyword to search"
                                size="small"
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Contract Address
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Address"
                                value={address}
                                placeholder="Enter contract address"
                                size="small"
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Token ID
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Token Id"
                                value={tokenId}
                                placeholder="Enter token id"
                                size="small"
                                style={{ marginTop: 8 }}
                                onChange={(e) => setTokenId(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Source Type
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                endIcon={<Icons.ArrowDownRound size={14} />}>
                                {sourceType ? resolveSourceTypeName(sourceType) : 'NO PROVIDER'}
                            </Button>
                            <ShadowRootMenu
                                anchorEl={anchorEl}
                                open={!!anchorEl}
                                defaultValue={SourceType.OpenSea}
                                onClose={() => setAnchorEl(null)}>
                                {getEnumAsArray(SourceType).map((x) => {
                                    return (
                                        <MenuItem key={x.key} value={x.value} onClick={() => setSourceType(x.value)}>
                                            {x.key}
                                        </MenuItem>
                                    )
                                })}
                            </ShadowRootMenu>
                        </TableCell>
                    </TableRow>
                    {APIs.map(([key, parameters]) => {
                        return (
                            <TableRow key={key}>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        {key}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                console.log(`Query ${key}:`)
                                                console.log(
                                                    // @ts-expect-error the ...parameters call is unsafe
                                                    await getHub(pluginID)[key]?.(...parameters, {
                                                        chainId,
                                                        account,
                                                        sourceType,
                                                    }),
                                                )
                                            } catch (error) {
                                                console.error(error)
                                            }
                                        }}>
                                        Query
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Open Select Token
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={async () => {
                                    SelectFungibleTokenModal.openAndWaitForClose({
                                        pluginID: NetworkPluginID.PLUGIN_SOLANA,
                                        lockChainId: true,
                                    })
                                }}>
                                Query
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
