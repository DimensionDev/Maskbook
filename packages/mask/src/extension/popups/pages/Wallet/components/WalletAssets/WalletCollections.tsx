import { CollectionList, type CollectionListProps } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useBlockedNonFungibleTokens, useTrustedNonFungibleTokens } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { forwardRef, memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../../utils/index.js'
import { WalletAssetTabs } from '../../type.js'
import { useParamTab } from '../../../../hooks/index.js'

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
    gap: '8px',
}
const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        importNft: {
            cursor: 'pointer',
            color: isDark ? theme.palette.maskColor.main : theme.palette.maskColor.highlight,
            fontSize: 14,
            fontWeight: 400,
            textAlign: 'center',
        },
    }
})

interface Props {
    onAddToken: (assetTab: WalletAssetTabs) => void
    scrollTargetRef: CollectionListProps['scrollElementRef']
}

export const WalletCollections = memo<Props>(
    forwardRef<HTMLDivElement, Props>(function WalletCollections({ onAddToken, scrollTargetRef }, ref) {
        const { t } = useI18N()
        const { classes } = useStyles()
        const [currentTab] = useParamTab<WalletAssetTabs>(WalletAssetTabs.Tokens)
        const [, setParams] = useSearchParams()
        const trustedTokens = useTrustedNonFungibleTokens(NetworkPluginID.PLUGIN_EVM)
        const blockedTokens = useBlockedNonFungibleTokens()
        const additionalAssets = useMemo(() => {
            const ids = blockedTokens.map((x) => x.id)
            return ids.length ? trustedTokens.filter((x) => !ids.includes(x.id)) : trustedTokens
        }, [trustedTokens, blockedTokens])
        const navigate = useNavigate()
        const SEARCH_KEY = 'collectionId'
        const handleItemClick = useCallback(
            (asset: Web3Helper.NonFungibleTokenAll) => {
                const path = urlcat(PopupRoutes.CollectibleDetail, {
                    chainId: asset.chainId,
                    address: asset.address,
                    id: asset.tokenId,
                })
                navigate(path, { state: { asset } })
            },
            [navigate],
        )
        const handleCollectionChange = useCallback(
            (id: string | undefined) => {
                setParams(
                    (params) => {
                        if (!id) params.delete(SEARCH_KEY)
                        else params.set(SEARCH_KEY, id)
                        return params.toString()
                    },
                    { replace: true },
                )
            },
            [setParams],
        )

        const collectiblesEmptyText = (
            <>
                <Typography component="div">{t('do_not_see_your_nft')}</Typography>
                <Typography className={classes.importNft} role="button" onClick={() => onAddToken(currentTab)}>
                    {t('import_nft')}
                </Typography>
            </>
        )
        return (
            <CollectionList
                ref={ref}
                gridProps={gridProps}
                disableSidebar
                disableWindowScroll
                scrollElementRef={scrollTargetRef}
                emptyText={collectiblesEmptyText}
                additionalAssets={additionalAssets}
                onItemClick={handleItemClick}
                onCollectionChange={handleCollectionChange}
            />
        )
    }),
)
