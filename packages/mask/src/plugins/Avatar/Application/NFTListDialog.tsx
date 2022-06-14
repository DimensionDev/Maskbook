import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ChainId } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Button, DialogActions, DialogContent, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import type { AllChainsNonFungibleToken, SelectTokenInfo } from '../types'
import { range, uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import { AddressNames } from './WalletList'
import { useAccount, useChainId, useCurrentWeb3NetworkPluginID, useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'
import { toPNG } from '../utils'
import { NFTListPage } from './NFTListPage'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { NFTList } from './NFTList'

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
        marginBottom: 72,
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
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

function isSameToken(token?: AllChainsNonFungibleToken, tokenInfo?: AllChainsNonFungibleToken) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
}
interface NFTListDialogProps {
    onNext: () => void
    tokenInfo?: AllChainsNonFungibleToken
    wallets?: BindingProof[]
    onSelected: (info: SelectTokenInfo) => void
}

export function NFTListDialog(props: NFTListDialogProps) {
    const { onNext, wallets, onSelected, tokenInfo } = props
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount(currentPluginId)
    const currentChainId = useChainId<'all'>(currentPluginId)
    const [chainId, setChainId] = useState<ChainId>((currentChainId ?? ChainId.Mainnet) as ChainId)
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(account ?? wallets?.[0]?.identity ?? '')
    const [selectedPluginId, setSelectedPluginId] = useState(currentPluginId ?? NetworkPluginID.PLUGIN_EVM)
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])

    const {
        value: collectibles = EMPTY_LIST,
        done: loadFinish,
        next: nextPage,
        error: loadError,
    } = useNonFungibleAssets(selectedPluginId, undefined, {
        chainId,
        account: selectedAccount,
    })

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginId: NetworkPluginID, chainId: ChainId) => {
        setSelectedAccount(address)
        setSelectedPluginId(pluginId)
        setChainId(chainId)
        setSelectedToken(undefined)
    }

    const onChangeToken = (token: AllChainsNonFungibleToken) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.metadata?.imageURL) return
        setDisabled(true)

        try {
            const image = await toPNG(selectedToken.metadata.imageURL)
            if (!image) {
                showSnackbar(t.download_image_error(), { variant: 'error' })
                return
            }
            onSelected({
                image: URL.createObjectURL(image),
                account: selectedAccount,
                token: selectedToken,
                pluginId: selectedPluginId,
            })
            setDisabled(false)
            onNext()
        } catch (error) {
            showSnackbar(String(error), { variant: 'error' })
            return
        }
    }, [selectedToken, selectedAccount, selectedPluginId])

    const onClick = useCallback(() => {
        if (!account && !wallets?.length) {
            showSnackbar(t.connect_wallet(), { variant: 'error' })
            return
        }
        setOpen_(true)
    }, [account, wallets, showSnackbar])

    useEffect(() => {
        setDisabled(!selectedToken || isSameToken(selectedToken, tokenInfo))
    }, [selectedToken, tokenInfo])

    useEffect(() => {
        setSelectedPluginId(currentPluginId)
    }, [currentPluginId])

    useEffect(() => {
        setChainId(currentChainId as ChainId)
    }, [currentChainId])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets])

    const onAddClick = (token: AllChainsNonFungibleToken) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address.toLowerCase() + x.tokenId))
    }

    const onChangeChain = (chainId: ChainId) => {
        setChainId(chainId)
    }

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary" textAlign="center" fontSize={14} fontWeight={600}>
                {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                    chainId === ChainId.Matic ? (
                        <Translate.collectible_on_polygon
                            components={{
                                br: <br />,
                            }}
                        />
                    ) : (
                        t.collectible_no_eth()
                    )
                ) : (
                    t.collectible_no_collectible()
                )}
            </Typography>

            {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                <Button className={classes.AddCollectiblesButton} variant="text" onClick={() => setOpen_(true)}>
                    {t.add_collectible()}
                </Button>
            ) : null}
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
            <Button className={classes.button} variant="text" onClick={nextPage}>
                {t.retry()}
            </Button>
        </Box>
    )

    const tokensInList = uniqBy(
        [...tokens, ...collectibles],
        selectedPluginId === NetworkPluginID.PLUGIN_SOLANA
            ? (x) => x.tokenId
            : (x) => x.contract?.address.toLowerCase() + x.tokenId,
    )

    const NoNFTList = () => {
        if (!collectibles.length && !loadFinish && !loadError) {
            return LoadStatus
        }
        if (chainId === ChainId.Matic && tokensInList.length) return
        if (tokensInList.length === 0) return AddCollectible
        if (loadError && !loadFinish && !collectibles.length) {
            return Retry
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
                    onChange={onChangeWallet}
                />
                {(account || Boolean(wallets?.length)) &&
                    (selectedPluginId !== NetworkPluginID.PLUGIN_EVM ? (
                        <NFTListPage
                            pluginId={selectedPluginId}
                            tokens={tokensInList}
                            tokenInfo={selectedToken}
                            onChange={onChangeToken}
                            children={NoNFTList()}
                            nextPage={nextPage}
                            loadError={!!loadError}
                            loadFinish={loadFinish}
                        />
                    ) : (
                        <NFTList
                            chainId={chainId}
                            onSelect={onChangeToken}
                            tokens={tokensInList}
                            tokenInfo={selectedToken}
                            children={NoNFTList()}
                            onChangeChain={onChangeChain}
                            nextPage={nextPage}
                            loadError={!!loadError}
                            loadFinish={loadFinish}
                        />
                    ))}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {selectedPluginId === NetworkPluginID.PLUGIN_EVM && tokensInList.length ? (
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

                <ActionButtonPromise
                    className={classes.button}
                    disabled={disabled}
                    init={!selectedToken ? t.set_PFP_title() : t.set_avatar_title()}
                    waiting={t.downloading_image()}
                    executor={onSave}
                    completeIcon={null}
                    failIcon={null}
                    failed={t.set_avatar_title()}
                    failedOnClick="use executor"
                    data-testid="confirm_button"
                    complete={t.set_avatar_title()}>
                    {!selectedToken ? t.set_PFP_title() : t.set_avatar_title()}
                </ActionButtonPromise>
            </DialogActions>
            <AddNFT
                account={selectedAccount}
                chainId={chainId as ChainId}
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
                expectedPluginID={selectedPluginId}
            />
        </>
    )
}
