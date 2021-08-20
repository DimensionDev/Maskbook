import { Box, Paper, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { FormattedAddress } from '@masknet/shared'
import { resolveAddressLinkOnExplorer, getChainName, ChainId, useChainId } from '@masknet/web3-shared'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { Account } from './Account'
import { resolveTraitLinkOnOpenSea } from '../pipes'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            paddingTop: 0,
            paddingBottom: '0 !important',
        },
        container: {
            padding: theme.spacing(1),
        },
        markdown: {
            margin: theme.spacing(1, 0),
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
    }
})

export interface TokenTabProps {}

export function TokenTab(props: TokenTabProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { token, asset } = CollectibleState.useContainer()

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
                            <Account
                                address={asset.value.creator.address}
                                username={asset.value.creator.user?.username}
                            />
                        </Link>
                    </Typography>
                ) : asset.value.owner ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link href={asset.value.owner.link} target="_blank" rel="noopener noreferrer">
                            <Account
                                address={asset.value.owner?.user?.username}
                                username={asset.value.owner?.address}
                            />
                        </Link>
                    </Typography>
                ) : null}
                <Markdown classes={{ root: classes.markdown }} content={asset.value?.description ?? ''} />
            </Box>

            {asset.value.traits?.length ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_properties')}
                    </Typography>

                    <Box className={classes.trait_content}>
                        {asset.value.traits.map(({ trait_type, value }) => {
                            return (
                                <Link
                                    underline="none"
                                    key={trait_type + value}
                                    href={
                                        asset.value?.slug
                                            ? resolveTraitLinkOnOpenSea(chainId, asset.value.slug, trait_type, value)
                                            : ''
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Paper className={classes.trait} variant="outlined">
                                        <Typography variant="body2" color="primary">
                                            {trait_type}
                                        </Typography>
                                        <Typography variant="body2">{value}</Typography>
                                    </Paper>
                                </Link>
                            )
                        })}
                    </Box>
                </Box>
            ) : null}

            {asset.value.asset_contract.name && asset.value.asset_contract?.description ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_about')} {asset.value.asset_contract.name}
                    </Typography>
                    <Typography className={classes.description} variant="body2">
                        {asset.value.asset_contract?.description}
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
                        href={resolveAddressLinkOnExplorer(ChainId.Mainnet, token?.contractAddress ?? '')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            <FormattedAddress address={token?.contractAddress ?? ''} size={4} />
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
                    <Typography variant="body2">{getChainName(chainId)}</Typography>
                </Box>
            </Box>
        </CollectibleTab>
    )
}
