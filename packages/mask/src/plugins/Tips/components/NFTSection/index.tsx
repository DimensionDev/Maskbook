import { type HTMLProps, useCallback, useMemo } from 'react'
import { Web3 } from '@masknet/web3-providers'
import { compact, uniqWith } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { useChainContext, useNonFungibleAssets, useNetworkContext, useWeb3State } from '@masknet/web3-hooks-base'
import { AddCollectiblesModal, ElementAnchor, RetryHint } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isLensProfileAddress, isLensFollower, isLensCollect, SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { FormControl, Typography } from '@mui/material'
import { CollectibleList } from '../../../../extension/options-page/DashboardComponents/CollectibleList/index.js'
import { useI18N } from '../../locales/index.js'
import { useTip } from '../../contexts/index.js'

export * from './NFTList.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        margin: theme.spacing(0, 2),
    },
    selectSection: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexGrow: 1,
        margin: theme.spacing(2, 0, 0),
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.spacing(4),
    },
    loadingText: {
        marginTop: theme.spacing(1),
        fontSize: 14,
    },
    collectibleList: {
        paddingRight: 0,
    },
    loadingList: {
        overflowY: 'scroll',
        flexGrow: 1,
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            minHeight: 50,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    addButton: {
        marginLeft: 'auto',
        cursor: 'pointer',
        color: theme.palette.maskColor.highlight,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onEmpty?(empty: boolean): void
}

export function NFTSection({ className, onEmpty, ...rest }: Props) {
    const {
        nonFungibleTokenAddress: tokenAddress,
        nonFungibleTokenId: tokenId,
        setNonFungibleTokenId,
        setNonFungibleTokenAddress,
    } = useTip()
    const { classes, theme, cx } = useStyles()
    const t = useI18N()
    const selectedKey = tokenAddress || tokenId ? `${tokenAddress}_${tokenId}` : undefined
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()

    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        loading,
        error: loadError,
    } = useNonFungibleAssets(pluginID, undefined, { chainId })

    const isEvm = pluginID === NetworkPluginID.PLUGIN_EVM
    const tokens = useMemo(() => {
        const filtered = isEvm
            ? fetchedTokens.filter((x) => {
                  if (isLensProfileAddress(x.address)) return false
                  if (x.metadata?.name && isLensFollower(x.metadata.name)) return false
                  if (x.collection?.name && isLensCollect(x.collection.name)) return false
                  return true
              })
            : fetchedTokens
        return uniqWith(
            filtered,
            isEvm
                ? (v1, v2) => {
                      return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
                  }
                : (v1, v2) => v1.tokenId === v2.tokenId,
        )
    }, [fetchedTokens, isEvm])

    const { Token } = useWeb3State(pluginID)
    const handleAddToken = useCallback(async () => {
        const { results: result } = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId,
        })
        if (!result || !chainId) return
        const [contract, tokenIds] = result
        const results = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const token = await Web3.getNonFungibleToken(contract.address, tokenId, SchemaType.ERC721, {
                    chainId: chainId as ChainId,
                    account,
                })
                await Token?.addToken?.(account, token)
                return token
            }),
        )
        const tokens = compact(results.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!tokens.length) return

        setNonFungibleTokenAddress(tokens[0].address)
        setNonFungibleTokenId(tokens[0].tokenId)
    }, [account, pluginID, chainId, Token?.addNonFungibleCollection])

    return (
        <div className={cx(classes.root, className)} {...rest}>
            <FormControl className={classes.header}>
                {isEvm && account ? (
                    <Typography className={classes.addButton} onClick={handleAddToken}>
                        {t.tip_add_collectibles()}
                    </Typography>
                ) : null}
            </FormControl>
            <div className={classes.selectSection}>
                {(() => {
                    if (tokens.length) {
                        return (
                            <div className={classes.loadingList}>
                                <CollectibleList
                                    classes={{ root: classes.collectibleList }}
                                    retry={next}
                                    collectibles={tokens}
                                    pluginID={pluginID}
                                    loading={loading}
                                    columns={4}
                                    selectable
                                    value={selectedKey}
                                    showNetworkIcon={false}
                                    onChange={(value: string | null) => {
                                        if (!value) {
                                            setNonFungibleTokenAddress('')
                                            setNonFungibleTokenId('')
                                            return
                                        }
                                        const [address, tokenId] = value.split('_')
                                        setNonFungibleTokenAddress(address)
                                        setNonFungibleTokenId(tokenId)
                                    }}
                                />
                                <ElementAnchor key={fetchedTokens.length} callback={() => next?.()}>
                                    {!done && <LoadingBase size={36} />}
                                </ElementAnchor>
                            </div>
                        )
                    }
                    if (tokens.length === 0 && loadError && account) {
                        return <RetryHint retry={next} />
                    }
                    if (tokens.length === 0 && (!done || loading) && account) {
                        return (
                            <div className={classes.statusBox}>
                                <LoadingBase size={36} />
                                <Typography className={classes.loadingText}>{t.tip_loading()}</Typography>
                            </div>
                        )
                    }
                    return (
                        <div className={classes.statusBox}>
                            <Icons.EmptySimple size={36} color={theme.palette.maskColor.third} />
                            <Typography className={classes.loadingText} color={theme.palette.maskColor.second}>
                                {t.tip_empty_nft()}
                            </Typography>
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}
