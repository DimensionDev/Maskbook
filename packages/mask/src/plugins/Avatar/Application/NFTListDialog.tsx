import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import {
    ChainId,
    ERC721TokenDetailed,
    getChainIdFromNetworkType,
    isSameAddress,
    SocketState,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { downloadUrl } from '../../../utils'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { range, uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import { NFTList } from './NFTList'
import { NetworkPluginID, useAccount, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'
import { PluginWalletStatusBar } from '../../../utils/components/PluginWalletStatusBar'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../Wallet/messages'
import { NetworkTab } from '../../../components/shared/NetworkTab'

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
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        marginLeft: 0,
    },
    content: {
        height: 612,
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
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
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    tableTabWrapper: {
        padding: theme.spacing(2),
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        height: 36,
        minHeight: 36,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 4,
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
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

    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const { data: collectibles, error, retry, state } = useCollectibles(selectedAccount, chainId)

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

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography
                color={currentPluginId !== NetworkPluginID.PLUGIN_EVM ? 'error' : 'textSecondary'}
                textAlign="center"
                fontSize={14}
                fontWeight={600}>
                {currentPluginId !== NetworkPluginID.PLUGIN_EVM ? (
                    <Translate.wallet_non_evm_warning
                        components={{
                            br: <br />,
                        }}
                    />
                ) : chainId === ChainId.Matic ? (
                    <Translate.collectible_on_polygon
                        components={{
                            br: <br />,
                        }}
                    />
                ) : (
                    t.collectible_no_eth()
                )}
            </Typography>
            {currentPluginId === NetworkPluginID.PLUGIN_EVM ? (
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
            <Button className={classes.button} variant="text" onClick={retry}>
                {t.retry()}
            </Button>
        </Box>
    )

    const NoNFTList = () => {
        if (chainId === ChainId.Matic && tokens.length === 0) return AddCollectible
        else if (chainId === ChainId.Matic && tokens.length) return
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
                {((account && currentPluginId === NetworkPluginID.PLUGIN_EVM) || Boolean(wallets?.length)) && (
                    <>
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab chains={chains} chainId={chainId} setChainId={setChainId} classes={classes} />
                        </div>
                        <NFTList
                            tokenInfo={tokenInfo}
                            address={selectedAccount}
                            chainId={chainId}
                            onSelect={onSelect}
                            tokens={uniqBy(
                                [...tokens, ...collectibles],
                                (x) => x.contractDetailed.address && x.tokenId,
                            )}
                            children={NoNFTList()}
                        />
                    </>
                )}
                {tokens.length || collectibles.length ? (
                    <Stack
                        style={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'row',
                            paddingLeft: 16,
                            position: 'absolute',
                            left: 0,
                            bottom: 89,
                        }}>
                        <Typography
                            variant="body1"
                            color="#1D9BF0"
                            sx={{ cursor: 'pointer', paddingLeft: 0.5 }}
                            onClick={onClick}>
                            {t.add_collectible()}
                        </Typography>
                    </Stack>
                ) : null}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PluginWalletStatusBar
                    actionProps={{
                        disabled,
                        action: onSave,
                        title: !selectedToken ? t.set_PFP_title() : t.set_avatar_title(),
                    }}
                    classes={{ button: classes.button }}
                    onChange={(address: string) => onChange(address)}
                    haveMenu
                />
            </DialogActions>
            <AddNFT
                account={selectedAccount}
                chainId={chainId}
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
            />
        </>
    )
}
