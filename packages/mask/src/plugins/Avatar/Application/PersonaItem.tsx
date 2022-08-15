import { makeStyles } from '@masknet/theme'
import { Box, Typography, ListItemButton } from '@mui/material'
import { NFTAvatar } from './NFTAvatar'
import { NFTInfo } from './NFTInfo'
import { MoreIcon } from '../assets/more'
import { RSS3_KEY_SNS } from '../constants'
import { useCheckTokenOwner } from '../hooks/useTokenOwner'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { useCallback, useMemo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { usePersonaNFTAvatar } from '../hooks/usePersonaNFTAvatar'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'
import type { AllChainsNonFungibleToken } from '../types'
import { useWallet } from '../hooks/useWallet'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, props) => ({
    root: {
        margin: theme.spacing(2, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },

    userInfo: {
        fontSize: 14,
        marginLeft: 16,
        flex: 1,
    },
}))

interface PersonaItemProps {
    owner?: boolean
    avatar: string
    userId: string
    nickname?: string
    proof?: BindingProof
    onSelect?: (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => void
}

export function PersonaItem(props: PersonaItemProps) {
    const { userId, onSelect, owner = false, proof, avatar, nickname = '' } = props
    const { classes } = useStyles({ disabled: !owner })
    const { value: _avatar, loading } = usePersonaNFTAvatar(userId, getAvatarId(avatar) ?? '', RSS3_KEY_SNS.TWITTER)
    const { loading: loadingWallet, value: storage } = useWallet(userId)

    const {
        loading: loadingCheckOwner,
        isOwner,
        name,
        symbol,
        schema,
    } = useCheckTokenOwner(
        _avatar?.pluginId ?? storage?.networkPluginID ?? NetworkPluginID.PLUGIN_EVM,
        userId,
        _avatar?.address ?? '',
        _avatar?.tokenId ?? '',
        _avatar?.schema ?? SchemaType.ERC721,
    )

    const tokenDetailed: AllChainsNonFungibleToken = useMemo(
        () => ({
            tokenId: _avatar?.tokenId ?? '',
            contract: {
                chainId: _avatar?.chainId ?? ChainId.Mainnet,
                name: name ?? '',
                symbol: symbol ?? 'ETH',
                address: _avatar?.address ?? '',
                schema: schema ?? SchemaType.ERC721,
                owner: '',
            },
            metadata: {
                chainId: _avatar?.chainId ?? ChainId.Mainnet,
                name: name ?? '',
                symbol: symbol ?? 'ETH',
            },
            id: _avatar?.address ?? '',
            chainId: _avatar?.chainId ?? ChainId.Mainnet,
            type: TokenType.NonFungible,
            schema: schema ?? SchemaType.ERC721,
            address: _avatar?.address ?? '',
        }),
        [_avatar, name, symbol, schema],
    )

    const onClick = useCallback(() => {
        if (!proof) return
        onSelect?.(proof, _avatar && isOwner ? tokenDetailed : undefined)
    }, [_avatar, proof])

    return (
        <ListItemButton className={classes.root} onClick={onClick} disabled={!owner || !proof}>
            <NFTAvatar
                owner={owner}
                avatar={avatar || _avatar?.imageUrl}
                hasBorder={!!_avatar}
                platform={proof?.platform}
            />
            <Box className={classes.userInfo}>
                <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                    {nickname || _avatar?.nickname}
                </Typography>
                <Typography variant="body1" color="textSecondary" fontSize={12}>
                    @{userId}
                </Typography>
            </Box>

            <NFTInfo
                loading={loading || loadingCheckOwner || loadingWallet}
                owner={Boolean(isOwner && _avatar?.avatarId && _avatar?.avatarId === getAvatarId(avatar))}
                nft={
                    _avatar
                        ? {
                              name: name ?? '',
                              symbol: symbol ?? '',
                              tokenId: _avatar?.tokenId ?? '',
                              address: _avatar?.address ?? '',
                              chainId: _avatar.chainId ?? ChainId.Mainnet,
                              networkPluginID: _avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM,
                          }
                        : undefined
                }
            />

            <MoreIcon style={{ marginLeft: 8 }} />
        </ListItemButton>
    )
}
