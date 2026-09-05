import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { useAccount, useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { TokenIcon } from '@masknet/shared'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { TokenDetailUI } from '../TokenDetail/index.js'
import { ContractSection } from '../../../../../shared/src/UI/components/CoinMetadataTable/ContractSection.js'
import { useAsset } from '../hooks/useAsset.js'
import type { InteractionItemProps } from './interaction.js'
import { TokenType } from '@masknet/web3-shared-base'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()({
    title: { fontSize: 28 },
    subtitle: { fontSize: 16 },
    caption: { opacity: 0.8, display: 'block', marginTop: 16 },
    icon: { width: 36, height: 36 },
    iconContainer: { display: 'flex', alignItems: 'center', gap: 12 },
})

// TODO: wallet_watchAsset SHOULD check the name and symbol fields, and the contract address and chainId against a list of well-known tokens. If the name and/or symbol are similar to ones on the list but the chainId/address don’t match, a warning SHOULD be presented to the user.
export const WatchTokenRequest = memo<InteractionItemProps>((props) => {
    const { currentRequest: request, setConfirmAction } = props
    const { classes } = useStyles()
    const { Message, Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount()

    const { params } = request.request.arguments
    setConfirmAction(async () => {
        const type = params[0].type
        const address = params[0].options.address
        if (type === 'ERC21') {
            // TODO: custom name currently are ignored
            await Token!.addToken!(account, {
                address,
                chainId,
                schema: SchemaType.ERC20,
                type: TokenType.Fungible,
                id: `${chainId}.${address}`,
                isCustomToken: true,
            })
        } else if (type === 'ERC721' || type === 'ERC1155') {
            const { tokenId, symbol, name = 'NFT' } = params[0].options
            const schema = type === 'ERC21' ? SchemaType.ERC721 : SchemaType.ERC1155
            await Token!.addNonFungibleTokens!(account, { address, chainId, name, schema, symbol }, [tokenId])
            await Token!.addToken!(account, {
                id: `${chainId}.${address}.${tokenId}`,
                chainId,
                tokenId,
                type: TokenType.NonFungible,
                schema,
                address,
                isCustomToken: true,
            })
        }
        // It is "deny" because we don't want send it to the upstream RPC.
        await Message!.rejectRequest(request.ID)
    })

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        options: { address, symbol, image, tokenId },
        type,
    } = params[0] as {
        options: { address: string; symbol: string; image: string; tokenId?: string }
        type: 'ERC20' | 'ERC721' | 'ERC1155'
    }
    const asset = useAsset(chainId, address, account)

    const isTrustedName = !!asset?.name

    return (
        <Box>
            <Typography variant="subtitle1" className={classes.title}>
                <Trans>Add Suggested Token</Trans>
            </Typography>
            <Typography variant="body1" className={classes.subtitle}>
                <Trans>Be aware, check the token before adding it.</Trans>
            </Typography>

            <Typography variant="caption" className={classes.caption}>
                <Trans>Token</Trans>
            </Typography>
            <Typography variant="body1" component="div" className={classes.iconContainer}>
                <TokenIcon
                    className={classes.icon}
                    chainId={chainId as ChainId}
                    address={address}
                    name={symbol}
                    size={60}
                    disableBadge
                />
                {isTrustedName ?
                    asset?.name
                :   <>
                        {symbol} <Trans>(the name is set by the web site)</Trans>
                    </>
                }
            </Typography>

            <Typography variant="caption" className={classes.caption}>
                <Trans>Token Address</Trans>
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
                        <Trans>Token Value</Trans>
                    </Typography>
                    <TokenDetailUI hideChart valueAlign="left" address={address} chainId={chainId} />
                </>
            :   null}
        </Box>
    )
})
WatchTokenRequest.displayName = 'WatchTokenRequest'
