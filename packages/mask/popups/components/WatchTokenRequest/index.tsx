import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWallet, useWeb3Hub } from '@masknet/web3-hooks-base'
import type { TransactionDetail } from '../../pages/Wallet/type.js'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { TokenIcon } from '@masknet/shared'
import { type ChainId } from '@masknet/web3-shared-evm'
import { TokenDetailUI } from '../../pages/Wallet/TokenDetail/index.js'
import { ContractSection } from '../../../../shared/src/UI/components/CoinMetadataTable/ContractSection.js'
import { useAsset } from '../../pages/Wallet/hooks/useAsset.js'
import { CollectibleDetailUI } from '../../pages/Wallet/CollectibleDetail/index.js'
import { useAsync } from 'react-use'

const useStyles = makeStyles()({
    title: { fontSize: 28 },
    subtitle: { fontSize: 16 },
    caption: { opacity: 0.8, display: 'block', marginTop: 16 },
    icon: { width: 36, height: 36 },
    iconContainer: { display: 'flex', alignItems: 'center', gap: 12 },
})

interface WatchTokenRequestProps {
    transaction: TransactionDetail
}

// TODO: wallet_watchAsset SHOULD check the name and symbol fields, and the contract address and chainId against a list of well-known tokens. If the name and/or symbol are similar to ones on the list but the chainId/address don’t match, a warning SHOULD be presented to the user.
export const WatchTokenRequest = memo<WatchTokenRequestProps>(function WatchTokenRequest({ transaction }) {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        options: { address, symbol, image, tokenId },
        type,
    } = transaction.payload.params![0] as {
        options: { address: string; symbol: string; image: string; tokenId?: string }
        type: 'ERC20' | 'ERC721' | 'ERC1155'
    }
    const asset = useAsset(chainId, address, useWallet()?.address)

    const isTrustedName = !!asset?.name

    return (
        <Box>
            <Typography variant="subtitle1" className={classes.title}>
                {t.popups_wallet_add_suggested_token()}
            </Typography>
            <Typography variant="body1" className={classes.subtitle}>
                {t.popups_wallet_add_suggested_token_warning()}
            </Typography>

            <Typography variant="caption" className={classes.caption}>
                {t.token()}
            </Typography>
            <Typography variant="body1" component="div" className={classes.iconContainer}>
                <TokenIcon
                    className={classes.icon}
                    chainId={chainId as ChainId}
                    address={address}
                    name={symbol}
                    size={60}
                />
                {isTrustedName ?
                    asset?.name
                :   <>
                        {symbol} {t.popups_wallet_add_suggested_token_no_wellknown_name()}
                    </>
                }
            </Typography>

            <Typography variant="caption" className={classes.caption}>
                {t.token_address()}
            </Typography>
            <ContractSection
                fullAddress
                align="flex-start"
                iconURL={image}
                pluginID={NetworkPluginID.PLUGIN_EVM}
                chainId={chainId}
                address={address}
                name={address}
            />

            {type === 'ERC20' ?
                <>
                    <Typography variant="caption" className={classes.caption}>
                        {t.token_value()}
                    </Typography>
                    <TokenDetailUI hideChart valueAlign="left" address={address} chainId={chainId} />
                </>
            : (type === 'ERC721' || type === 'ERC1155') && tokenId ?
                <NonFungibleAsset address={address} chainId={chainId} tokenId={tokenId} />
            :   null}
        </Box>
    )
})
function NonFungibleAsset({ address, chainId, tokenId }: { address: string; chainId: ChainId; tokenId: string }) {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()

    const Hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { value: asset } = useAsync(() => {
        return Hub.getNonFungibleAsset(address, tokenId, { chainId })
    })
    if (!asset) return
    return (
        <>
            <Typography variant="caption" className={classes.caption}>
                {t.token_value()}
            </Typography>
            <CollectibleDetailUI stateAsset={asset} />
        </>
    )
}
