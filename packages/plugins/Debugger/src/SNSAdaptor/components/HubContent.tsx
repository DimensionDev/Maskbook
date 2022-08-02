import type { FormEvent } from 'react'
import { useWeb3Hub } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { OrderSide, SourceType } from '@masknet/web3-shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
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

export interface HubContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function HubContent(props: HubContentProps) {
    const { classes } = useStyles()
    const hub = useWeb3Hub()

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Non-Fungible Token Hub APIs
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
                                    const options = {
                                        sourceType: SourceType.LooksRare,
                                    }
                                    const allSettled = await Promise.allSettled([
                                        hub?.getNonFungibleTokenBalance?.(address, options),
                                        hub?.getNonFungibleTokenContract?.(address, options),
                                        hub?.getNonFungibleTokenEvents?.(address, tokenId, options),
                                        hub?.getNonFungibleTokenOffers?.(address, tokenId, options),
                                        hub?.getNonFungibleTokenListings?.(address, tokenId, options),
                                        hub?.getNonFungibleTokenOrders?.(address, tokenId, OrderSide.Buy, options),
                                        hub?.getNonFungibleTokenOrders?.(address, tokenId, OrderSide.Sell, options),
                                        hub?.getNonFungibleAsset?.(address, tokenId, options),
                                        hub?.getNonFungibleToken?.(address, tokenId, options),
                                    ])
                                    const keys = [
                                        'getNonFungibleTokenBalance',
                                        'getNonFungibleTokenContract',
                                        'getNonFungibleTokenEvents',
                                        'getNonFungibleTokenOffers',
                                        'getNonFungibleTokenListings',
                                        'getNonFungibleTokenOrders Buy',
                                        'getNonFungibleTokenOrders Sell',
                                        'getNonFungibleAsset',
                                        'getNonFungibleToken',
                                    ]

                                    console.log(
                                        Object.fromEntries(
                                            allSettled.map((settled, i) => [
                                                keys[i],
                                                settled.status === 'fulfilled' ? settled.value : undefined,
                                            ]),
                                        ),
                                    )
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
                                            control={<Radio size="small" />}
                                            label="ERC721"
                                        />
                                        <FormControlLabel
                                            value={SchemaType.ERC1155}
                                            control={<Radio size="small" />}
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
                </TableBody>
            </Table>
        </section>
    )
}
