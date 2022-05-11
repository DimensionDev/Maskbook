import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import {
    ChainId,
    ERC721TokenDetailed,
    isSameAddress,
    SocketState,
    useAccount,
    useCollectibles,
} from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { downloadUrl } from '../../../utils'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { range, uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import { AddressNames } from './WalletList'
import { NFTList } from './NFTList'
import { Application_NFT_LIST_PAGE } from '../constants'
import { NetworkPluginID, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'

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
    AddCollectiblesbutton: {
        fontWeight: 600,
        color: '#1D9BF0',
    },
    actions: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
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

function isSameToken(token?: ERC721TokenDetailed, tokenInfo?: TokenInfo) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.contractDetailed.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
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

    const account = useAccount()
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed>()
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const [tokens, setTokens] = useState<ERC721TokenDetailed[]>([])
    const [currentPage, setCurrentPage] = useState<Application_NFT_LIST_PAGE>(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
    )
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const {
        data: collectibles,
        error,
        retry,
        state,
    } = useCollectibles(
        selectedAccount,
        currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page ? ChainId.Mainnet : ChainId.Matic,
    )

    const { showSnackbar } = useCustomSnackbar()
    const onChange = useCallback((address: string) => {
        setSelectedAccount(address)
    }, [])

    const onSelect = (token: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.info?.imageURL) return
        setDisabled(true)
        try {
            const image = await downloadUrl(selectedToken.info.imageURL)
            onSelected({ image: URL.createObjectURL(image), account: selectedAccount, token: selectedToken })
            onNext()
            setDisabled(false)
        } catch (error) {
            console.log(error)
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

    const onAddClick = (token: ERC721TokenDetailed) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contractDetailed.address && x.tokenId))
    }

    const onChangePage = (name: Application_NFT_LIST_PAGE) => {
        setCurrentPage(name)
        setSelectedToken(undefined)
    }

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary" textAlign="center">
                {currentPage !== Application_NFT_LIST_PAGE.Application_nft_tab_eth_page ? (
                    <Translate.collectible_on_polygon
                        components={{
                            br: <br />,
                        }}
                    />
                ) : (
                    t.collectible_no_eth()
                )}
            </Typography>
            <Button className={classes.AddCollectiblesbutton} variant="text" onClick={() => setOpen_(true)}>
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
        if (currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page && tokens.length === 0)
            return AddCollectible
        else if (currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page && tokens.length) return
        if (state !== SocketState.done) {
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

    if (!wallets?.length && (currentPluginId !== NetworkPluginID.PLUGIN_EVM || !account))
        return (
            <DialogContent className={classes.content}>
                <NFTWalletConnect />
            </DialogContent>
        )

    return (
        <>
            <DialogContent className={classes.content}>
                <AddressNames
                    account={account}
                    wallets={wallets ?? []}
                    classes={{ root: classes.AddressNames }}
                    onChange={onChange}
                />
                {((account && currentPluginId === NetworkPluginID.PLUGIN_EVM) || Boolean(wallets?.length)) && (
                    <NFTList
                        tokenInfo={tokenInfo}
                        address={selectedAccount}
                        onSelect={onSelect}
                        onChangePage={onChangePage}
                        tokens={uniqBy([...tokens, ...collectibles], (x) => x.contractDetailed.address && x.tokenId)}
                        children={NoNFTList()}
                    />
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {tokens.length || collectibles.length ? (
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row', paddingLeft: 2 }}>
                        <Typography variant="body1" color="textPrimary">
                            {t.collectible_not_found()}
                        </Typography>
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
                chainId={
                    currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page
                        ? ChainId.Mainnet
                        : ChainId.Matic
                }
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
            />
        </>
    )
}
