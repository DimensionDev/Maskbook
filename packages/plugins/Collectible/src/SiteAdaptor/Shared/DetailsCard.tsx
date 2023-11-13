import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import { useCollectibleTrans } from '../../locales/i18n_generated.js'

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
        gap: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        textTransform: 'capitalize',
        overflow: 'auto',
    },
    title: {
        color: theme.palette.maskColor.second,
    },
    content: {
        flexGrow: 1,
        textAlign: 'right',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        color: theme.palette.maskColor.main,
    },
    value: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        flexGrow: 1,
    },
    link: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
    },
}))

interface DetailsCardProps {
    asset: Web3Helper.NonFungibleAssetAll
    sourceType?: SourceType
}

export function DetailsCard(props: DetailsCardProps) {
    const { asset, sourceType } = props
    const t = useCollectibleTrans()
    const { classes } = useStyles()
    const Utils = useWeb3Utils()
    const { pluginID } = useNetworkContext()

    const infos: Array<{ title: string; value?: string; link?: boolean; tooltip?: string }> = []
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) {
        infos.push({
            title: t.plugin_collectible_mint_address(),
            value: Utils.formatAddress(asset.address, 4),
            link: true,
        })
    } else if (pluginID === NetworkPluginID.PLUGIN_EVM) {
        infos.push(
            { title: t.plugin_collectible_token_id(), value: Utils.formatTokenId(asset.tokenId, 4) },
            { title: t.contract(), value: Utils.formatAddress(asset.address, 4) ?? '-', link: true },
        )
    }
    infos.push(
        { title: t.plugin_collectible_block_chain(), value: Utils.chainResolver.chainFullName(asset.chainId) },
        { title: t.token_standard(), value: Utils.formatSchemaType(asset.schema || asset.contract?.schema) },
    )
    if (sourceType && PLATFORM_COSTS[sourceType]) {
        infos.push({
            title: t.plugin_collectible_platform_costs({ platform: sourceType ?? SourceType.NFTScan }),
            value: `${PLATFORM_COSTS[sourceType]}%`,
        })
    }

    return (
        <div className={classes.root}>
            {infos.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.title}>{x.title}</Typography>
                        <Typography className={classes.content} component="div">
                            <TextOverflowTooltip title={x.value} as={ShadowRootTooltip}>
                                <Typography className={classes.value}>{x.value} </Typography>
                            </TextOverflowTooltip>
                            {x.link ?
                                <Link
                                    className={classes.link}
                                    href={Utils.explorerResolver.addressLink(asset.chainId, asset.address) ?? ''}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.LinkOut size={16} />
                                </Link>
                            :   null}
                            {x.value && x.tooltip ?
                                <ShadowRootTooltip title={x.tooltip} placement="top">
                                    <Icons.Info size={18} />
                                </ShadowRootTooltip>
                            :   null}
                        </Typography>
                    </div>
                )
            })}
        </div>
    )
}
