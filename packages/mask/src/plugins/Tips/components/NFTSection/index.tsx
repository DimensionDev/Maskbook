import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { RetryHint } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { SchemaType } from '@masknet/web3-shared-evm'
import { Button, Typography } from '@mui/material'
import classnames from 'classnames'
import { uniqWith } from 'lodash-unified'
import { FC, HTMLProps, useEffect, useMemo, useState } from 'react'
import { useTimeoutFn } from 'react-use'
import { TargetRuntimeContext, useTip } from '../../contexts'
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
        minHeight: '100%',
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
    const {
        nonFungibleTokenAddress: tokenAddress,
        nonFungibleTokenId: tokenId,
        setNonFungibleTokenId,
        setNonFungibleTokenAddress,
    } = useTip()
    const { classes } = useStyles()
    const t = useI18N()
    const selectedPairs: TipNFTKeyPair[] = useMemo(() => (tokenId ? [[tokenAddress, tokenId]] : []), [tokenId, tokenId])
    // Cannot get the loading status of fetching via websocket
    // loading status of `useAsyncRetry` is not the real status
    const [guessLoading, setGuessLoading] = useState(true)
    useTimeoutFn(() => {
        setGuessLoading(false)
    }, 10000)

    const { targetChainId: chainId, pluginId } = TargetRuntimeContext.useContainer()
    // const { value: fetchedTokens = EMPTY_LIST, loading } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    // TODO: add address and chainId && retry
    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        error: loadError,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, SchemaType.ERC721)

    const isEvm = pluginId === NetworkPluginID.PLUGIN_EVM
    const tokens = useMemo(() => {
        return uniqWith(
            fetchedTokens,
            isEvm
                ? (v1, v2) => {
                      return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
                  }
                : (v1, v2) => v1.tokenId === v2.tokenId,
        )
    }, [fetchedTokens, isEvm])

    const showLoadingIndicator = tokens.length === 0 && done && !guessLoading

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
                                    setNonFungibleTokenId(id)
                                    setNonFungibleTokenAddress(address || '')
                                }}
                                nextPage={next}
                                loadFinish={done}
                            />
                        )
                    }
                    if (tokens.length === 0 && loadError) {
                        return <RetryHint retry={next} />
                    }
                    if (tokens.length === 0 && (!done || guessLoading)) {
                        return (
                            <div className={classes.statusBox}>
                                <LoadingBase />
                                <Typography className={classes.loadingText}>{t.tip_loading()}</Typography>
                            </div>
                        )
                    }
                    return (
                        <div className={classes.statusBox}>
                            <Typography className={classes.loadingText}>{t.tip_empty_nft()}</Typography>
                            {isEvm ? (
                                <Button variant="text" onClick={onAddToken}>
                                    {t.tip_add_collectibles()}
                                </Button>
                            ) : null}
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}
