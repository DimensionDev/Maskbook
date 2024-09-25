import { CollectibleList, ElementAnchor } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, LoadingBase, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNonFungibleAsset, useNonFungibleAssets, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isLensCollect, isLensFollower, isLensProfileAddress } from '@masknet/web3-shared-evm'
import { uniqWith } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useNonFungibleTokenParams } from '../../../hooks/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        section: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100%',
            overflow: 'auto',
            flexGrow: 1,
        },
        scroll: {
            flexGrow: 1,
            overflow: 'auto',
            paddingBottom: theme.spacing(9),
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        collectibleList: {
            padding: 0,
            flexGrow: 1,
        },
        actionGroup: {
            position: 'absolute',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            background: theme.palette.maskColor.secondaryBottom,
            boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(8px)',
            gap: theme.spacing(2),
            padding: theme.spacing(2),
            width: '100%',
            bottom: 0,
            zIndex: 100,
            marginTop: 'auto',
        },
    }
})

function getCollectibleKey(token: Web3Helper.NonFungibleAssetAll) {
    return `${token.chainId}.${token.address}.${token.tokenId}`
}
export const NonFungibleTokenSection = memo(function NonFungibleTokenSection() {
    const { classes } = useStyles()
    const { chainId, address, tokenId, params, setParams } = useNonFungibleTokenParams()

    const {
        data: fetchedTokens = EMPTY_LIST,
        hasNextPage,
        fetchNextPage,
        isPending,
        dataUpdatedAt,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    const tokens = useMemo(() => {
        const filtered = fetchedTokens.filter((x) => {
            if (isLensProfileAddress(x.address)) return false
            if (x.metadata?.name && isLensFollower(x.metadata.name)) return false
            if (x.collection?.name && isLensCollect(x.collection.name)) return false
            return true
        })
        return uniqWith(filtered, (v1, v2) => {
            return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
        })
    }, [fetchedTokens])

    const hasSelected = address && tokenId
    const selectedKey = hasSelected ? `${chainId}.${address}.${tokenId}` : undefined

    const handleChange = useCallback((value: string | null) => {
        setParams(
            (p) => {
                if (!value) {
                    p.delete('nft:chainId')
                    p.delete('nft:address')
                    p.delete('nft:tokenId')
                    return p.toString()
                }
                const [chainId, address, tokenId] = value.split('.')
                p.set('nft:chainId', chainId)
                p.set('nft:address', address)
                p.set('nft:tokenId', tokenId)
                return p.toString()
            },
            { replace: true },
        )
    }, [])

    // Collectibles are lazy loading, we can't let the target token scroll into view before it's loaded
    // So we fetch and prepend it to the list.
    const { data: targetToken } = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, address || '', tokenId || '', {
        chainId,
    })
    const prependTokens = useMemo(() => {
        if (!hasSelected || !targetToken) return tokens
        const loadedTargetToken = tokens.find(
            (x) => x.chainId === chainId && isSameAddress(x.address, address) && x.tokenId === tokenId,
        )
        if (loadedTargetToken) return tokens
        return [targetToken, ...tokens]
    }, [hasSelected, targetToken, tokens, chainId, address, tokenId])

    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
        chainId,
    })
    const recipient = params.get('recipient')

    const { showSnackbar } = usePopupCustomSnackbar()

    const [state, transfer] = useAsyncFn(async () => {
        try {
            if (!address || !tokenId || !recipient) return
            await Web3.transferNonFungibleToken(address!, tokenId, recipient, '1')
            return
        } catch (error) {
            showSnackbar(<Trans>Network error or execute smart contract failed.</Trans>, { variant: 'error' })
            return
        }
    }, [address, tokenId || recipient])

    const tokenNotReady = !address || !tokenId
    const disabled = tokenNotReady || state.loading

    return (
        <div className={classes.section}>
            <div className={classes.scroll} data-hide-scrollbar>
                <CollectibleList
                    className={classes.collectibleList}
                    retry={fetchNextPage}
                    collectibles={prependTokens}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    loading={isPending || !!hasNextPage}
                    columns={4}
                    gap={1}
                    selectable
                    value={selectedKey}
                    showNetworkIcon
                    getCollectibleKey={getCollectibleKey}
                    onChange={handleChange}
                />
                {hasNextPage ?
                    // There might be chains that has no assets, setting key to token size might stuck the loading
                    <ElementAnchor key={dataUpdatedAt} callback={() => fetchNextPage()}>
                        <LoadingBase size={36} />
                    </ElementAnchor>
                :   null}
            </div>
            <div className={classes.actionGroup}>
                <ActionButton fullWidth onClick={transfer} disabled={disabled} loading={state.loading}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </div>
        </div>
    )
})
