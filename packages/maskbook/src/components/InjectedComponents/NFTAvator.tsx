import { useStylesExtends, useValueRef } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared'
import { Box, Button, Link, Skeleton, TablePagination, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import { head } from 'lodash-es'
import { useCallback, useState } from 'react'
import { PluginCollectibleRPC } from '../../plugins/Collectible/messages'
import { getOrderUnitPrice } from '../../plugins/Collectible/utils'
import { currentCollectibleDataProviderSettings } from '../../plugins/Wallet/settings'
import { EthereumChainBoundary } from '../../web3/UI/EthereumChainBoundary'

const useStyles = makeStyles()((theme) => ({
    root: {},
    title: {
        padding: 0,
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: theme.spacing(1),
    },
    AddCollectible: {
        textAlign: 'right',
        paddingBottom: theme.spacing(1),
    },
    NFTBox: {
        border: `1px solid ${getMaskColor(theme).border}`,
        broderRadius: 4,
        padding: theme.spacing(1),
    },
    NFTImage: {
        display: 'flex',
        flexFlow: 'row wrap',
        height: 150,
        overflowY: 'auto',
        justifyContent: 'center',
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        margin: theme.spacing(0.5, 1.5),
        borderRadius: '100%',
        '&:hover': {
            border: `1px solid ${getMaskColor(theme).blue}`,
        },
        boxSizing: 'border-box',
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
    },
    setNFTAvator: {
        paddingLeft: 64,
        paddingRight: 64,
    },
    selected: {
        border: `1px solid ${getMaskColor(theme).blue}`,
    },
}))

async function getNFTAmount(token: ERC721TokenDetailed) {
    if (!(token.contractDetailed.address && token.tokenId)) return null

    const asset = await PluginCollectibleRPC.getAsset(token.contractDetailed.address, token.tokenId)
    const order = head(
        (asset.sellOrders ?? []).sort(
            (a, b) =>
                new BigNumber(getOrderUnitPrice(a) ?? 0).toNumber() -
                new BigNumber(getOrderUnitPrice(b) ?? 0).toNumber(),
        ),
    )
    return order ? new BigNumber(getOrderUnitPrice(order) ?? 0).toNumber() : null
}

export interface NFTAvatorProps extends withClasses<'root'> {
    onChange: (token: ERC721TokenDetailed, amount: string) => void
}

export function NFTAvator(props: NFTAvatorProps) {
    const { onChange } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const [page, setPage] = useState(0)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()
    const {
        value = {
            collectibles: [],
            hasNextPage: false,
        },
        loading,
        retry,
        error,
    } = useCollectibles('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', chainId, provider, page, 50)

    const { collectibles = [], hasNextPage } = value

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        const amount = await getNFTAmount(selectedToken)
        onChange(selectedToken, amount?.toFixed() ?? '0')
    }, [onChange, selectedToken])

    return (
        <Box className={classes.root}>
            <Box className={classes.title}>
                <Typography variant="body1">NFT Avator Setting</Typography>
                {account ? (
                    <Typography variant="body1">
                        Wallet: {formatEthereumAddress(account, 4)} <Link>Change</Link>
                    </Typography>
                ) : null}
            </Box>
            <EthereumChainBoundary chainId={chainId}>
                <Box className={classes.NFTBox}>
                    <Box className={classes.AddCollectible}>
                        <Button variant="outlined" size="small">
                            Add Collectibles
                        </Button>
                    </Box>
                    <Box className={classes.NFTImage}>
                        {loading
                            ? Array.from({ length: 24 })
                                  .fill(0)
                                  .map((_, i) => (
                                      <Skeleton
                                          animation="wave"
                                          variant="rectangular"
                                          className={classes.image}
                                          key={i}
                                      />
                                  ))
                            : collectibles.map((token: ERC721TokenDetailed, i) => (
                                  <img
                                      key={i}
                                      onClick={() => setSelectedToken(token)}
                                      src={token.info.image}
                                      className={classnames(
                                          classes.image,
                                          selectedToken === token ? classes.selected : '',
                                      )}
                                  />
                              ))}
                    </Box>

                    {!(page === 0 && collectibles.length === 0) ? (
                        <TablePagination
                            count={-1}
                            component="div"
                            onPageChange={() => {}}
                            page={page}
                            rowsPerPage={30}
                            rowsPerPageOptions={[30]}
                            labelDisplayedRows={() => null}
                            backIconButtonProps={{
                                onClick: () => setPage(page - 1),
                                size: 'small',
                                disabled: page === 0,
                            }}
                            nextIconButtonProps={{
                                onClick: () => setPage(page + 1),
                                disabled: !hasNextPage,
                                size: 'small',
                            }}
                        />
                    ) : null}
                    <Box className={classes.button}>
                        <Button
                            variant="contained"
                            size="medium"
                            className={classes.setNFTAvator}
                            onClick={() => onClick()}
                            disabled={!selectedToken}>
                            Set NFT Avator
                        </Button>
                    </Box>
                </Box>
            </EthereumChainBoundary>
        </Box>
    )
}
