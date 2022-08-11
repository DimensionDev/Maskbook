import { makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { SchemaType, formatTokenId, ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { Icons } from '@masknet/icons'

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
        alignItems: 'center',
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
    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
    },
}))

interface NFTInfoCardProps {
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    sourceType?: SourceType
}

export function NFTInfoCard(props: NFTInfoCardProps) {
    const { asset, sourceType } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    const { t } = useI18N()

    const infoConfigMapping = [
        { title: t('plugin_collectible_token_id'), value: formatTokenId(asset.tokenId, 4) },
        { title: t('contract'), value: Others?.formatAddress(asset.address, 4) ?? '-', link: true },
        { title: t('plugin_collectible_block_chain'), value: 'Ethereum' },
        { title: t('plugin_collectible_token_schema'), value: asset.contract?.schema ?? SchemaType.ERC721 },
        {
            title: t('plugin_collectible_creator_earning'),
            value: `${Number.parseInt(asset.contract?.creatorEarning || '0', 10) / 100}%` ?? '0',
        },
        {
            title: t('plugin_collectible_platform_costs', { platform: sourceType ?? SourceType.OpenSea }),
            value: '-',
        },
    ]
    return (
        <div className={classes.wrapper}>
            {infoConfigMapping.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.textBase}>{x.title}</Typography>
                        <Typography className={classes.listItemContent}>
                            {x.value}{' '}
                            {x.link && (
                                <Link
                                    className={classes.link}
                                    href={Others?.explorerResolver.addressLink?.(ChainId.Mainnet, asset.address) ?? ''}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.LinkOut size={16} />
                                </Link>
                            )}
                        </Typography>
                    </div>
                )
            })}
        </div>
    )
}
