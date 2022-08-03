import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 8,
        borderRadius: 12,
        background: '#F9F9F9',
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
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function NFTInfoCard(props: NFTInfoCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={172} />
    const _asset = asset.value
    const infoConfigMapping = [
        { title: 'Token ID', value: _asset.tokenId },
        { title: 'Contract', value: Others?.formatAddress(_asset.address, 4) ?? '-' },
        { title: 'Blockchain', value: 'Ethereum' },
        { title: 'Token Standard', value: _asset.contract?.schema ?? SchemaType.ERC721 },
        { title: 'Creator Royalties', value: _asset.contract?.creatorEarning ?? '0' },
        { title: 'OpenSea Platform costs', value: '2.5%' },
    ]
    return (
        <div className={classes.wrapper}>
            {infoConfigMapping.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.textBase}>{x.title}</Typography>
                        <div className={classes.listItemContent}>{x.value}</div>
                    </div>
                )
            })}
        </div>
    )
}
