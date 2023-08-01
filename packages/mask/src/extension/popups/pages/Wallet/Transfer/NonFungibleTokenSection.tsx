import { CollectibleList, ElementAnchor } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNonFungibleAssets, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isLensCollect, isLensFollower, isLensProfileAddress } from '@masknet/web3-shared-evm'
import { uniqWith } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useI18N } from '../../../../../utils/index.js'
import { useNonFungibleTokenParams } from '../../../hook/index.js'
import { useAsyncFn } from 'react-use'

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

const getCollectibleKey = (token: Web3Helper.NonFungibleAssetAll) => {
    return `${token.chainId}.${token.address}.${token.tokenId}`
}
export const NonFungibleTokenSection = memo(function NonFungibleTokenSection() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId, address, tokenId, params, setParams } = useNonFungibleTokenParams()

    const { value: fetchedTokens = EMPTY_LIST, done, next, loading } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
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

    const selectedKey = address && tokenId ? `${chainId}.${address}.${tokenId}` : undefined

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

    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
        chainId,
    })
    const recipient = params.get('recipient')
    const [state, transfer] = useAsyncFn(async () => {
        if (!address || !tokenId || !recipient) return
        return Web3.transferNonFungibleToken(address!, tokenId, recipient, '1')
    }, [address, tokenId || recipient])

    const tokenNotReady = !address || !tokenId
    const disabled = tokenNotReady || state.loading

    return (
        <div className={classes.section}>
            <div className={classes.scroll} data-hide-scrollbar>
                <CollectibleList
                    className={classes.collectibleList}
                    retry={next}
                    collectibles={tokens}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    loading={loading}
                    columns={4}
                    gap={1}
                    selectable
                    value={selectedKey}
                    showNetworkIcon
                    getCollectibleKey={getCollectibleKey}
                    onChange={handleChange}
                />
                <ElementAnchor key={fetchedTokens.length} callback={() => next?.()}>
                    {!done && <LoadingBase size={36} />}
                </ElementAnchor>
            </div>
            <div className={classes.actionGroup}>
                <ActionButton fullWidth onClick={transfer} disabled={disabled} loading={state.loading}>
                    {t('confirm')}
                </ActionButton>
            </div>
        </div>
    )
})
