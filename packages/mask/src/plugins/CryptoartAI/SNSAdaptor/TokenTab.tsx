import { Box, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleTab } from './CollectibleTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { FormattedAddress } from '@masknet/shared'
import { resolveAddressLinkOnExplorer, getChainName, useChainId } from '@masknet/web3-shared-evm'
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
                        <Link
                            href={resolveWebLinkOnCryptoartAI(chainId) + '/' + asset.value.creator.username}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account address={asset.value.creator.ethAddress} username={asset.value.creator.username} />
                        </Link>
                    </Typography>
                ) : null}
                {asset.value.owner[0] ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_owned_by')}{' '}
                        <Link
                            href={resolveWebLinkOnCryptoartAI(chainId) + '/' + asset.value.owner[0].ownerName}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Account
                                address={asset.value.owner[0]?.ownerAddress}
                                username={asset.value.owner[0]?.ownerName}
                            />
                        </Link>
                    </Typography>
                ) : null}
                {asset.value.linkWithCreation ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_view_on')}{' '}
                        <Link href={asset.value.linkWithCreation} target="_blank" rel="noopener noreferrer">
                            etherscan
                        </Link>
                    </Typography>
                ) : null}
                {asset.value.linkWithIpfs ? (
                    <Typography variant="body2">
                        {t('plugin_collectible_view_on')}{' '}
                        <Link href={asset.value.linkWithIpfs} target="_blank" rel="noopener noreferrer">
                            IPFS
                        </Link>
                    </Typography>
                ) : null}
                <Markdown classes={{ root: classes.markdown }} content={asset.value?.description ?? ''} />
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
                            <FormattedAddress address={token?.contractAddress ?? ''} size={4} />
                        </Typography>
                    </Link>
                </Box>
                <Box className={classes.chain_row}>
                    <Typography variant="body2">{t('plugin_collectible_token_id')}</Typography>
                    <Typography className={classes.tokenId} variant="body2">
                        {asset.value?.editionNumber}
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
