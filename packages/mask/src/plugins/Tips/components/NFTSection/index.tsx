import { useNetworkDescriptor, useWeb3State as useWeb3PluginState } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import { Button, CircularProgress, Typography } from '@mui/material'
import classnames from 'classnames'
import { uniqWith } from 'lodash-unified'
import { FC, HTMLProps, useEffect, useMemo, useState } from 'react'
import { useAsyncFn, useTimeoutFn } from 'react-use'
import { WalletMessages } from '../../../Wallet/messages'
import { useTip } from '../../contexts'
import { useI18N } from '../../locales'
import type { TipNFTKeyPair } from '../../types'
import { NFTList } from './NFTList'

export * from './NFTList'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: 282,
    },
    selectSection: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 282,
    },
    loadingText: {
        marginTop: theme.spacing(1),
    },
    list: {
        flexGrow: 1,
        maxHeight: 400,
        overflow: 'auto',
        borderRadius: 4,
    },
    errorMessage: {
        marginTop: theme.spacing(3),
        fontSize: 12,
        color: theme.palette.error.main,
        marginBottom: theme.spacing(3),
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onAddToken?(): void
    onEmpty?(empty: boolean): void
}

export const NFTSection: FC<Props> = ({ className, onAddToken, onEmpty, ...rest }) => {
    const { erc721Address, erc721TokenId, setErc721TokenId, setErc721Address } = useTip()
    const { classes } = useStyles()
    const t = useI18N()
    const account = useAccount()
    const selectedPairs: TipNFTKeyPair[] = useMemo(
        () => (erc721Address && erc721TokenId ? [[erc721Address, erc721TokenId]] : []),
        [erc721TokenId, erc721TokenId],
    )
    const { Asset } = useWeb3PluginState()

    const networkDescriptor = useNetworkDescriptor()

    // Cannot get the loading status of fetching via websocket
    // loading status of `useAsyncRetry` is not the real status
    const [guessLoading, setGuessLoading] = useState(true)
    useTimeoutFn(() => {
        setGuessLoading(false)
    }, 10000)

    const [{ value = { data: EMPTY_LIST }, loading }, fetchTokens] = useAsyncFn(async () => {
        const result = await Asset?.getNonFungibleAssets?.(account, { page: 0 }, undefined, networkDescriptor)
        return result
    }, [account, Asset?.getNonFungibleAssets, networkDescriptor])

    useEffect(() => {
        fetchTokens()
    }, [fetchTokens])

    useEffect(() => {
        const unsubscribeTokens = WalletMessages.events.erc721TokensUpdated.on(fetchTokens)
        const unsubscribeSocket = WalletMessages.events.socketMessageUpdated.on((info) => {
            setGuessLoading(info.done)
            if (!info.done) {
                fetchTokens()
            }
        })
        return () => {
            unsubscribeTokens()
            unsubscribeSocket()
        }
    }, [fetchTokens])

    const fetchedTokens = value?.data ?? EMPTY_LIST

    const tokens = useMemo(() => {
        return uniqWith(fetchedTokens, (v1, v2) => {
            return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
        })
    }, [fetchedTokens])

    const showLoadingIndicator = tokens.length === 0 && !loading && !guessLoading

    useEffect(() => {
        onEmpty?.(showLoadingIndicator)
    }, [onEmpty, showLoadingIndicator])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <div className={classes.selectSection}>
                {(() => {
                    if (tokens.length) {
                        return (
                            <NFTList
                                className={classes.list}
                                selectedPairs={selectedPairs}
                                tokens={tokens}
                                onChange={(id, address) => {
                                    setErc721TokenId(id)
                                    setErc721Address(address)
                                }}
                            />
                        )
                    }
                    if (loading || guessLoading) {
                        return (
                            <div className={classes.statusBox}>
                                <CircularProgress size={24} />
                                <Typography className={classes.loadingText}>{t.tip_loading()}</Typography>
                            </div>
                        )
                    }
                    return (
                        <div className={classes.statusBox}>
                            <Typography className={classes.loadingText}>{t.tip_empty_nft()}</Typography>
                            <Button variant="text" onClick={onAddToken}>
                                {t.tip_add_collectibles()}
                            </Button>
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}
