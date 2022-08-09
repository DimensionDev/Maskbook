import { Box, Paper, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { FormattedAddress } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatAddress } from '@masknet/web3-shared-solana'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { Account } from './Account'
import { resolveTraitLinkOnOpenSea, resolveUserUrlOnCurrentProvider } from '../pipes'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

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
    const { token, asset, provider } = CollectibleState.useContainer()

    const chainId = useChainId(
        provider === SourceType.MagicEden ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
    )
    const { Others } = useWeb3State(
        provider === SourceType.MagicEden ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
    )

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
                        <Link
                            href={resolveUserUrlOnCurrentProvider(
                                chainId,
                                asset.value.creator?.address ?? '',
                                provider,
                                asset.value.creator.nickname,
                            )}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account address={asset.value.creator.address} username={asset.value.creator.nickname} />
                        </Link>
                    </Typography>
                ) : asset.value.owner ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link
                            href={resolveUserUrlOnCurrentProvider(
                                chainId,
                                (asset.value.owner?.address || asset.value.ownerId) ?? '',
                                provider,
                                asset.value.owner?.nickname,
                            )}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account
                                address={asset.value.owner?.address || asset.value.ownerId}
                                username={asset.value.owner?.address}
                            />
                        </Link>
                    </Typography>
                ) : null}
                <Markdown classes={{ root: classes.markdown }} content={asset.value?.metadata?.description ?? ''} />
            </Box>

            {asset.value.traits?.length ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_properties')}
                    </Typography>

                    <Box className={classes.trait_content}>
                        {asset.value.traits.map(({ type, value }, key) => (
                            <Link
                                underline="none"
                                key={key}
                                href={
                                    asset.value?.collection?.slug
                                        ? resolveTraitLinkOnOpenSea(chainId, asset.value.collection?.slug, type, value)
                                        : ''
                                }
                                target="_blank"
                                rel="noopener noreferrer">
                                <Paper className={classes.trait} variant="outlined">
                                    <Typography variant="body2" color="primary">
                                        {type}
                                    </Typography>
                                    <Typography variant="body2">{value}</Typography>
                                </Paper>
                            </Link>
                        ))}
                    </Box>
                </Box>
            ) : null}

            {asset.value.contract ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_collectible_about')} {asset.value.contract.name}
                    </Typography>
                    <Typography className={classes.description} variant="body2">
                        {asset.value.metadata?.description}
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
                        href={Others?.explorerResolver.addressLink(chainId, token?.contractAddress ?? '')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            <FormattedAddress
                                address={token?.contractAddress ?? ''}
                                size={4}
                                formatter={provider === SourceType.MagicEden ? formatAddress : formatEthereumAddress}
                            />
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
                    <Typography variant="body2">{Others?.chainResolver.chainName(chainId)}</Typography>
                </Box>
            </Box>
        </CollectibleTab>
    )
}
