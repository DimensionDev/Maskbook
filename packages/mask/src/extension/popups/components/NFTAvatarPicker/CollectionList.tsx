import { CollectibleCard, EmptyStatus, isSameNFT } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box, Skeleton } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { makeStyles } from '@masknet/theme'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { range } from 'lodash-es'

export interface CollectionListProps {
    loading: boolean
    tokens: Web3Helper.NonFungibleAssetAll[]
    account?: string
    selected?: Web3Helper.NonFungibleAssetAll
    onItemClick: (item: Web3Helper.NonFungibleAssetAll) => void
}

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        rowGap: 16,
        columnGap: 8,
    },
    item: {
        height: 86,
        maxHeight: 86,
    },
}))

export const CollectionList = memo<CollectionListProps>(function CollectionList({
    loading,
    tokens,
    account,
    selected,
    onItemClick,
}) {
    const { t } = useI18N()
    const { pluginID } = useNetworkContext()
    const { classes } = useStyles()

    if ((!loading && !tokens.length) || !account) {
        return (
            <Box>
                <EmptyStatus flex={1}>{t('no_NFTs_found')}</EmptyStatus>
            </Box>
        )
    }

    if (loading && !tokens.length) {
        return (
            <Box className={classes.container}>
                {range(20).map((_, index) => (
                    <Box className={classes.item} key={index}>
                        <Skeleton animation="wave" variant="rectangular" sx={{ borderRadius: '8px' }} height="100%" />
                    </Box>
                ))}
            </Box>
        )
    }

    return (
        <Box className={classes.container}>
            {tokens.length
                ? tokens.map((x, index) => (
                      <CollectibleCard
                          className={classes.item}
                          asset={x}
                          key={index}
                          disableNetworkIcon
                          onClick={() => onItemClick(x)}
                          isSelected={isSameNFT(pluginID, x, selected)}
                          useRadio
                      />
                  ))
                : null}
        </Box>
    )
})
