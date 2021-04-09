import { makeStyles, createStyles, Typography, Link, Box } from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) => {
    return createStyles({
        container: {
            margin: theme.spacing(1.5, 0),
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
            // color: '#15181B',
        },
        chain_row: {
            display: 'flex',
            justifyContent: 'space-between',
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

    if (!asset.value) return null

    return (
        <CollectibleTab>
            <Box className={classes.container}>
                <Typography variant="h6">{t('plugin_collectible_base')}</Typography>

                <Typography>
                    {asset.value.creator ? (
                        <Typography variant="subtitle2">
                            {t('plugin_collectible_create_by')}{' '}
                            <Link
                                href={`https://opensea.io/accounts/${
                                    asset.value.creator.user?.username ?? asset.value.creator.address
                                }`}>
                                {asset.value.creator.user?.username ?? asset.value.creator.address.slice(2, 8)}
                            </Link>
                        </Typography>
                    ) : (
                        <Typography variant="subtitle2">
                            {t('plugin_collectible_owned_by')}{' '}
                            <Link
                                href={`https://opensea.io/accounts/${
                                    asset.value.owner?.user?.username ?? asset.value.owner?.address ?? ''
                                }`}>
                                {asset.value.owner?.user?.username ?? asset.value.owner?.address.slice(2, 8) ?? ''}
                            </Link>
                        </Typography>
                    )}
                    <Typography className={classes.description}>{asset.value.description}</Typography>
                </Typography>
            </Box>

            {asset.value.traits && asset.value.traits.length ? (
                <Box className={classes.container}>
                    <Typography variant="h6">{t('plugin_collectible_properties')}</Typography>

                    <Box className={classes.trait_content}>
                        {asset.value.traits.map(({ trait_type, value }) => {
                            return (
                                <Box className={classes.trait} key={trait_type + value}>
                                    <Typography sx={{ color: '#1C68F3' }}>{trait_type}</Typography>
                                    <Typography>{value}</Typography>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            ) : null}

            {asset.value.assetContract.name && asset.value.assetContract.description ? (
                <Box className={classes.container}>
                    <Typography variant="h6">
                        {t('plugin_collectible_about')} {asset.value.assetContract.name}
                    </Typography>

                    <Typography className={classes.description}>{asset.value.assetContract.description}</Typography>
                </Box>
            ) : null}

            <Box className={classes.container}>
                <Typography variant="h6">{t('plugin_collectible_chain_info')}</Typography>

                <Box className={classes.chain_row}>
                    <Typography>{t('plugin_collectible_contract_address')}</Typography>
                    <Link
                        href={`https://etherscan.io/address/${token?.contractAddress ?? ''}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography>
                            {token?.contractAddress.slice(0, 6)}...{token?.contractAddress.slice(-6)}
                        </Typography>
                    </Link>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography>{t('plugin_collectible_token_id')}</Typography>
                    <Typography className={classes.tokenId}>{token?.tokenId}</Typography>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography>{t('plugin_collectible_block_chain')}</Typography>
                    <Typography>Ethereum</Typography>
                </Box>
            </Box>
        </CollectibleTab>
    )
}
