import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../utils/index.js'

const PLATFORM_COSTS: {
    [k in SourceType]?: number
} = {
    [SourceType.OpenSea]: 2.5,
    [SourceType.X2Y2]: 0.5,
    [SourceType.LooksRare]: 2,
}

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 8,
        borderRadius: 12,
        backgroundColor: theme.palette.maskColor.bg,
    },
    listItem: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    content: {
        maxWidth: '40%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: 6,
        color: theme.palette.maskColor.main,
    },
    link: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
    },
}))

export interface DetailsCardProps {
    asset: Web3Helper.NonFungibleAssetScope<'all'>
    sourceType?: SourceType
}

export function DetailsCard(props: DetailsCardProps) {
    const { asset, sourceType } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const { Others } = useWeb3State()

    const infoConfigMapping = [
        { title: t('plugin_collectible_token_id'), value: Others?.formatTokenId(asset.tokenId, 4) },
        { title: t('contract'), value: Others?.formatAddress(asset.address, 4) ?? '-', link: true },
        { title: t('plugin_collectible_block_chain'), value: Others?.chainResolver.chainFullName(asset.chainId) },
        { title: t('token_standard'), value: Others?.formatSchemaType(asset.schema || asset.contract?.schema) },
        {
            title: t('plugin_collectible_creator_earning'),
            value: `${Number.parseInt(asset.contract?.creatorEarning || '0', 10) / 100}%` ?? '0',
        },
        {
            title: t('plugin_collectible_platform_costs', { platform: sourceType ?? SourceType.NFTScan }),
            value: sourceType && PLATFORM_COSTS[sourceType] ? `${PLATFORM_COSTS[sourceType]}%` : '-',
        },
    ]

    return (
        <div className={classes.root}>
            {infoConfigMapping.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.title}>{x.title}</Typography>
                        <Typography className={classes.content}>
                            {x.value}{' '}
                            {x.link && (
                                <Link
                                    className={classes.link}
                                    href={
                                        Others?.explorerResolver.nonFungibleTokenLink?.(
                                            asset.chainId,
                                            asset.address,
                                            asset.tokenId,
                                        ) ?? ''
                                    }
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
