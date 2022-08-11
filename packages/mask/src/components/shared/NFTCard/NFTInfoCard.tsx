import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { SchemaType, formatTokenId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 8,
        borderRadius: 12,
        background: theme.palette.maskColor.bg,
    },
    listItem: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    textBase: {
        fontSize: 14,
        color: theme.palette.text.secondary,
    },
    listItemContent: {
        maxWidth: '30%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: 6,
    },
}))

interface NFTInfoCardProps {
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
}

export function NFTInfoCard(props: NFTInfoCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    const { t } = useI18N()
    const infoConfigMapping = [
        { title: t('plugin_collectible_token_id'), value: formatTokenId(asset.tokenId, 4) },
        { title: t('contract'), value: Others?.formatAddress(asset.address, 4) ?? '-' },
        { title: t('plugin_collectible_block_chain'), value: 'Ethereum' },
        { title: t('plugin_collectible_token_standard'), value: asset.contract?.schema ?? SchemaType.ERC721 },
        { title: t('plugin_collectible_creator_earning'), value: asset.contract?.creatorEarning ?? '0' },
        { title: t('plugin_collectible_platform_costs', { platform: 'opensea' }), value: '2.5%' },
    ]
    return (
        <div className={classes.wrapper}>
            {infoConfigMapping.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.textBase}>{x.title}</Typography>
                        <Typography className={classes.listItemContent}>{x.value}</Typography>
                    </div>
                )
            })}
        </div>
    )
}
