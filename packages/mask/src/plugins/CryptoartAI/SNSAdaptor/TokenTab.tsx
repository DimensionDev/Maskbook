import { useMemo } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { FormattedAddress } from '@masknet/shared'
import { resolveAddressLinkOnExplorer, getChainName, useChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { Account } from './Account'
import { resolveWebLinkOnCryptoartAI } from '../pipes'

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
        edition_row: {
            display: 'flex',
            marginBottom: theme.spacing(0.5),
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

    const assetSource = useMemo(() => {
        if (!asset.value || asset.error) return
        return asset.value
    }, [asset.value])

    if (!asset.value) return null
    return (
        <CollectibleTab classes={{ content: classes.content }}>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_collectible_base')}
                </Typography>
                {assetSource?.creator ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_create_by')}{' '}
                        <Link
                            href={resolveWebLinkOnCryptoartAI(chainId) + '/' + assetSource?.creator.username}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account
                                address={assetSource?.creator.ethAddress}
                                username={formatEthereumAddress(assetSource?.creator.username, 4)}
                            />
                        </Link>
                    </Typography>
                ) : null}
                {assetSource?.owner[0] ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link
                            href={resolveWebLinkOnCryptoartAI(chainId) + '/' + assetSource?.owner[0].ownerName}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account
                                address={assetSource?.owner[0]?.ownerAddress}
                                username={formatEthereumAddress(assetSource?.owner[0]?.ownerName, 4)}
                            />
                        </Link>
                    </Typography>
                ) : null}
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_cryptoartai_description_title')}
                </Typography>
                <Markdown classes={{ root: classes.markdown }} content={assetSource?.description ?? ''} />
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_cryptoartai_edition')}
                </Typography>
                <Box className={classes.edition_row}>
                    {assetSource?.linkWithCreation ? (
                        <Typography variant="body2" style={{ marginRight: '20px' }}>
                            {t('plugin_collectible_view_on')}{' '}
                            <Link href={assetSource?.linkWithCreation} target="_blank" rel="noopener noreferrer">
                                ΞEtherscan
                            </Link>
                        </Typography>
                    ) : null}
                    {assetSource?.linkWithIpfs ? (
                        <Typography variant="body2">
                            {t('plugin_collectible_view_on')}{' '}
                            <Link href={assetSource?.linkWithIpfs} target="_blank" rel="noopener noreferrer">
                                IPFS
                            </Link>
                        </Typography>
                    ) : null}
                </Box>
            </Box>

            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_collectible_chain_info')}
                </Typography>

                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_contract_address')}</Typography>
                    <Link
                        href={resolveAddressLinkOnExplorer(chainId, token?.contractAddress ?? '')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            <FormattedAddress
                                address={token?.contractAddress ?? ''}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                        </Typography>
                    </Link>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_token_id')}</Typography>
                    <Typography className={classes.tokenId} variant="body2">
                        {assetSource?.editionNumber}
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
