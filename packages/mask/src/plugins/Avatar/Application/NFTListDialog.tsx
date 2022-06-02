import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { useCollectibles } from '../hooks/useCollectibles'
import { Box, Button, DialogActions, DialogContent, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { range, uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import { AddressNames } from './WalletList'
import { NFTList } from './NFTList'
import { Application_NFT_LIST_PAGE } from '../constants'
import { useAccount, useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'
import { toPNG } from '../utils'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 10,
        right: 10,
    },

    button: {
        width: 219.5,
        borderRadius: 999,
    },
    AddCollectiblesButton: {
        fontWeight: 600,
        color: '#1D9BF0',
    },
    actions: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 'calc(100% - 32px)',
    },
    content: {
        height: 612,
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        paddingTop: 260,
    },
    skeleton: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        padding: 6,
        margin: theme.spacing(0.5, 1),
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

function isSameToken(token?: NonFungibleToken<ChainId, SchemaType>, tokenInfo?: TokenInfo) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
}
interface NFTListDialogProps {
    onNext: () => void
    tokenInfo?: TokenInfo
    wallets?: BindingProof[]
    onSelected: (info: SelectTokenInfo) => void
}

export function NFTListDialog(props: NFTListDialogProps) {
    const { onNext, wallets, onSelected, tokenInfo } = props
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount(currentPluginId)
    const chainId = useChainId(currentPluginId)
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')
    const [selectedPluginId, setSelectedPluginId] = useState(currentPluginId)
    const [selectedToken, setSelectedToken] = useState<NonFungibleToken<ChainId, SchemaType>>()
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const [tokens, setTokens] = useState<Array<NonFungibleToken<ChainId, SchemaType>>>([])
    const [currentPage, setCurrentPage] = useState<Application_NFT_LIST_PAGE>(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
    )
    const POLYGON_PAGE = Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page
    const { collectibles, retry, error, loading } = useCollectibles(chainId as ChainId)
    const { showSnackbar } = useCustomSnackbar()
    const onChange = useCallback((address: string, pluginId: NetworkPluginID) => {
        setSelectedAccount(address)
        setSelectedPluginId(pluginId)
    }, [])

    const onSelect = (token: NonFungibleToken<ChainId, SchemaType>) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.metadata?.imageURL) return
        setDisabled(true)
        try {
            const image = await toPNG(selectedToken.metadata.imageURL)
            if (!image) {
                return
            }
            onSelected({ image: URL.createObjectURL(image), account: selectedAccount, token: selectedToken })
            onNext()
            setDisabled(false)
        } catch (error) {
            console.error(error)
        }
        setDisabled(false)
    }, [selectedToken, selectedAccount])

    const onClick = useCallback(() => {
        if (!account && !wallets?.length) {
            showSnackbar('Please connect your wallet!', { variant: 'error' })
            return
        }
        setOpen_(true)
    }, [account, wallets, showSnackbar])

    useEffect(() => {
        setDisabled(!selectedToken || isSameToken(selectedToken, tokenInfo))
    }, [selectedToken, tokenInfo])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets])

    const onAddClick = (token: NonFungibleToken<ChainId, SchemaType>) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address && x.tokenId))
    }

    const onChangePage = (name: Application_NFT_LIST_PAGE) => {
        setCurrentPage(name)
        setSelectedToken(undefined)
    }

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary" textAlign="center" fontSize={14} fontWeight={600}>
                {currentPage === POLYGON_PAGE ? (
                    <Translate.collectible_on_polygon
                        components={{
                            br: <br />,
                        }}
                    />
                ) : (
                    t.collectible_no_eth()
                )}
            </Typography>

            <Button className={classes.AddCollectiblesButton} variant="text" onClick={() => setOpen_(true)}>
                {t.add_collectible()}
            </Button>
        </Box>
    )

    const LoadStatus = (
        <div className={classes.gallery}>
            {range(8).map((i) => (
                <Skeleton key={i} animation="wave" variant="rectangular" className={classes.skeleton} />
            ))}
        </div>
    )

    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.no_collectible_found()}</Typography>
            <Button className={classes.button} variant="text" onClick={retry}>
                {t.retry()}
            </Button>
        </Box>
    )

    const NoNFTList = () => {
        if (currentPage === POLYGON_PAGE && tokens.length === 0) return AddCollectible
        else if (currentPage === POLYGON_PAGE && tokens.length) return
        if (loading) {
            return LoadStatus
        }
        if (error) {
            return Retry
        }
        if (tokens.length === 0 && collectibles.length === 0) {
            return AddCollectible
        }

        return
    }

    if (!wallets?.length && !account)
        return (
            <DialogContent className={classes.content}>
                <NFTWalletConnect />
            </DialogContent>
        )

    return (
        <>
            <DialogContent className={classes.content}>
                <AddressNames
                    account={account!}
                    wallets={wallets ?? []}
                    classes={{ root: classes.AddressNames }}
                    onChange={onChange}
                />
                {(account || Boolean(wallets?.length)) && (
                    <NFTList
                        tokenInfo={tokenInfo}
                        address={selectedAccount}
                        onSelect={onSelect}
                        onChangePage={onChangePage}
                        tokens={uniqBy([...tokens, ...collectibles], (x) => x.contract?.address && x.tokenId)}
                        children={NoNFTList()}
                    />
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {tokens.length || collectibles.length ? (
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row', paddingLeft: 2 }}>
                        <Typography
                            variant="body1"
                            color="#1D9BF0"
                            sx={{ cursor: 'pointer', paddingLeft: 0.5 }}
                            onClick={onClick}>
                            {t.add_collectible()}
                        </Typography>
                    </Stack>
                ) : null}

                <Button disabled={disabled} className={classes.button} onClick={onSave}>
                    {!selectedToken ? t.set_PFP_title() : t.set_avatar_title()}
                </Button>
            </DialogActions>
            <AddNFT
                account={selectedAccount}
                chainId={currentPage !== POLYGON_PAGE ? ChainId.Mainnet : ChainId.Matic}
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
                expectedPluginID={selectedPluginId}
            />
        </>
    )
}
