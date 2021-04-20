import { Box, Paper, createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'
import { formatEthereumAddress } from '../../Wallet/formatter'
import { resolveAddressLinkOnEtherscan } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { useRemarkable } from '../../Snapshot/hooks/useRemarkable'

const useStyles = makeStyles((theme) => {
    return createStyles({
        content: {
            paddingTop: 0,
            paddingBottom: '0 !important',
        },
        container: {
            padding: theme.spacing(1),
        },
        description: {
            fontSize: 14,
            wordBreak: 'break-all',
        },
        trait_content: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: theme.spacing(2),
        },
        trait: {
            padding: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 14,
            fontWeight: 600,
        },
        chain_row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(0.5),
            '&:last-child': {
                marginBottom: 0,
            },
        },
        tokenId: {
            maxWidth: 112,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    })
})

export interface TokenTabProps {}

export function TokenTab(props: TokenTabProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { token, asset } = CollectibleState.useContainer()
    const description = useRemarkable(asset.value?.description ?? '')
    if (!asset.value) return null
    return (
        <CollectibleTab classes={{ content: classes.content }}>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_collectible_base')}
                </Typography>

                {asset.value.creator ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_create_by')}{' '}
                        <Link href={asset.value.creator.link} target="_blank" rel="noopener noreferrer">
                            {asset.value.creator.user?.username ?? asset.value.creator.address?.slice(2, 8)}
                        </Link>
                    </Typography>
                ) : asset.value.owner ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link href={asset.value.owner.link} target="_blank" rel="noopener noreferrer">
                            {asset.value.owner?.user?.username ?? asset.value.owner?.address?.slice(2, 8) ?? ''}
                        </Link>
                    </Typography>
                ) : null}
                <Typography className={classes.description} variant="body2">
                    {asset.value.description}
                </Typography>

                {asset.value.creator ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_create_by')}{' '}
                        <Link href={asset.value.creator.link} target="_blank" rel="noopener noreferrer">
                            {asset.value.creator.user?.username ?? asset.value.creator.address?.slice(2, 8)}
                        </Link>
                    </Typography>
                ) : asset.value.owner ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link href={asset.value.owner.link} target="_blank" rel="noopener noreferrer">
                            {asset.value.owner?.user?.username ?? asset.value.owner?.address?.slice(2, 8) ?? ''}
                        </Link>
                    </Typography>
                ) : null}
                <Typography className={classes.description} dangerouslySetInnerHTML={{ __html: description }} />
            </Box>

            {asset.value.traits && asset.value.traits.length ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_properties')}
                    </Typography>

                    <Box className={classes.trait_content}>
                        {asset.value.traits.map(({ trait_type, value }) => {
                            return (
                                <Paper className={classes.trait} key={trait_type + value} variant="outlined">
                                    <Typography variant="body2" color="primary">
                                        {trait_type}
                                    </Typography>
                                    <Typography variant="body2">{value}</Typography>
                                </Paper>
                            )
                        })}
                    </Box>
                </Box>
            ) : null}

            {asset.value.assetContract.name && asset.value.assetContract?.description ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_about')} {asset.value.assetContract.name}
                    </Typography>
                    <Typography className={classes.description} variant="body2">
                        {asset.value.assetContract?.description}
                    </Typography>
                </Box>
            ) : null}

            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_collectible_chain_info')}
                </Typography>

                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_contract_address')}</Typography>
                    <Link
                        href={resolveAddressLinkOnEtherscan(ChainId.Mainnet, token?.contractAddress ?? '')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            {formatEthereumAddress(token?.contractAddress ?? '', 4)}
                        </Typography>
                    </Link>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_token_id')}</Typography>
                    <Typography className={classes.tokenId} variant="body2">
                        {token?.tokenId}
                    </Typography>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_block_chain')}</Typography>
                    <Typography variant="body2">Ethereum</Typography>
                </Box>
            </Box>
        </CollectibleTab>
    )
}
