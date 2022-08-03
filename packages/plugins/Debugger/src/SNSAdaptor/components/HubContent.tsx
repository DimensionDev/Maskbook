import { useCallback, useState } from 'react'
import { useAccount, useChainId, useWeb3Hub } from '@masknet/plugin-infra/web3'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { OrderSide, resolveSourceName, SourceType } from '@masknet/web3-shared-base'
import { Button, MenuItem, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { getEnumAsArray } from '@dimensiondev/kit'

export interface HubContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

const TransactionAPIs = ['getTransactions']

const NonFungibleTokenAPIs = [
    'getNonFungibleTokenBalance',
    'getNonFungibleTokenContract',
    'getNonFungibleTokenEvents',
    'getNonFungibleTokenOffers',
    'getNonFungibleTokenListings',
    'getNonFungibleTokenOrders',
    'getNonFungibleAsset',
    'getNonFungibleToken',
] as const

export function HubContent(props: HubContentProps) {
    const { classes } = useStyles()
    const hub = useWeb3Hub()
    const chainId = useChainId()
    const account = useAccount()
    const [address, setAddress] = useState<string>('0x7c3e8096b70a4ddc04c4344b8f33b97c9d12bc4e')
    const [tokenId, setTokenId] = useState<string>('1')
    const [sourceType, setSourceType] = useState(SourceType.OpenSea)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const onQueryTransactionAPI = useCallback(
        (method: typeof TransactionAPIs[number]) => {
            if (!account) throw new Error('Not account found.')
            switch (method) {
                case 'getTransactions':
                    return hub?.getTransactions?.(chainId, account)
                default:
                    throw new Error(`Not supported ${method}.`)
            }
        },
        [account, chainId, hub],
    )

    const onQueryNonFungibleTokenAPI = useCallback(
        (method: typeof NonFungibleTokenAPIs[number]) => {
            if (!address) throw new Error('No contract address.')

            switch (method) {
                case 'getNonFungibleTokenBalance':
                    return hub?.getNonFungibleTokenBalance?.(address, {
                        sourceType,
                    })
                case 'getNonFungibleTokenContract':
                    return hub?.getNonFungibleTokenContract?.(address, {
                        sourceType,
                    })
                case 'getNonFungibleTokenEvents':
                    return hub?.getNonFungibleTokenEvents?.(address, tokenId, {
                        sourceType,
                    })
                case 'getNonFungibleTokenOffers':
                    return hub?.getNonFungibleTokenOffers?.(address, tokenId, {
                        sourceType,
                    })
                case 'getNonFungibleTokenListings':
                    return hub?.getNonFungibleTokenListings?.(address, tokenId, {
                        sourceType,
                    })
                case 'getNonFungibleTokenOrders':
                    return hub?.getNonFungibleTokenOrders?.(address, tokenId, OrderSide.Buy, {
                        sourceType,
                    })
                case 'getNonFungibleAsset':
                    return hub?.getNonFungibleAsset?.(address, tokenId, {
                        sourceType,
                    })
                case 'getNonFungibleToken':
                    return hub?.getNonFungibleToken?.(address, tokenId, {
                        sourceType,
                    })
                default:
                    throw new Error(`Not supported ${method}.`)
            }
        },
        [hub, address, tokenId, sourceType],
    )

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
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
                            <Button size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                                {resolveSourceName(sourceType)}
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
                    {TransactionAPIs.map((x) => {
                        return (
                            <TableRow key={x}>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        {x}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                console.log(`Query ${x}:`)
                                                console.log(await onQueryTransactionAPI(x))
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
                    {NonFungibleTokenAPIs.map((x) => {
                        return (
                            <TableRow key={x}>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        {x}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                console.log(`Query ${x}:`)
                                                console.log(await onQueryNonFungibleTokenAPI(x))
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
                </TableBody>
            </Table>
        </section>
    )
}
