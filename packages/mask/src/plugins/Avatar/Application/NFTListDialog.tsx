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

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    button: {
        width: 219,
    },
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        paddingTop: 260,
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
    const { data: collectibles, error, retry, state } = useCollectibles(selectedAccount, ChainId.Mainnet)
    const { showSnackbar } = useCustomSnackbar()
    const onChange = useCallback((address: string) => {
        setSelectedAccount(address)
    }, [])

    const onSelect = (token: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }

    useEffect(() => {
        setTokens(currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page ? collectibles : [])
    }, [collectibles, currentPage])

    const LoadStatus = range(8).map((i) => (
        <div key={i} className={classes.skeletonBox}>
            <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
        </div>
    ))

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

    const onAddClick = useCallback(
        (token: ERC721TokenDetailed) =>
            setTokens((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId)),
        [tokens],
    )

    const onChangePage = (name: Application_NFT_LIST_PAGE) => {
        setCurrentPage(name)
    }

    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.no_collectible_found()}</Typography>
            <Button className={classes.button} variant="text" onClick={retry}>
                {t.retry()}
            </Button>
        </Box>
    )

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary" textAlign="center">
                <Translate.collectible_on_polygon
                    components={{
                        br: <br />,
                    }}
                />
            </Typography>
            <Button className={classes.button} variant="text" onClick={() => setOpen_(true)}>
                {t.add_collectible()}
            </Button>
        </Box>
    )
    return (
        <>
            <DialogContent sx={{ height: 612, padding: 0 }}>
                <AddressNames
                    account={account}
                    wallets={wallets ?? []}
                    classes={{ root: classes.AddressNames }}
                    onChange={onChange}
                />
                {state !== SocketState.done && collectibles.length === 0
                    ? LoadStatus
                    : error || collectibles.length === 0
                    ? currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page
                        ? Retry
                        : AddCollectible
                    : (account || Boolean(wallets?.length)) && (
                          <NFTList
                              tokenInfo={tokenInfo}
                              onSelect={onSelect}
                              onChangePage={onChangePage}
                              tokens={tokens}
                              address={selectedAccount}
                          />
                      )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {tokens.length ? (
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                        <Typography variant="body1" color="textPrimary">
                            {t.collectible_not_found()}
                        </Typography>
                        <Typography variant="body1" color="#1D9BF0" sx={{ cursor: 'pointer' }} onClick={onClick}>
                            {t.add_collectible()}
                        </Typography>
                    </Stack>
                ) : null}

                <Button disabled={disabled} className={classes.button} onClick={onSave}>
                    {t.set_avatar_title()}
                </Button>
            </DialogActions>
            <AddNFT
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
