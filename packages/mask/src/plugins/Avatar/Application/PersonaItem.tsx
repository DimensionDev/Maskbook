import { makeStyles } from '@masknet/theme'
import { Box, Typography, ListItemButton } from '@mui/material'
import { NFTAvatar } from './NFTAvatar.js'
import { NFTInfo } from './NFTInfo.js'
import { MoreIcon } from '../assets/more.js'
import { RSS3_KEY_SNS } from '../constants.js'
import { useCallback, useMemo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { usePersonaNFTAvatar } from '../hooks/usePersonaNFTAvatar.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TokenType } from '@masknet/web3-shared-base'
import type { AllChainsNonFungibleToken } from '../types.js'
import { useI18N } from '../locales/index.js'
import { Twitter } from '@masknet/web3-providers'

const useStyles = makeStyles<{
    disabled: boolean
}>()((theme, props) => ({
    root: {
        margin: theme.spacing(2, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        '&.Mui-disabled': {
            pointerEvents: 'auto',
        },
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
    persona?: string
    onSelect?: (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => void
}

export function PersonaItem(props: PersonaItemProps) {
    const { userId, onSelect, owner = false, proof, avatar, nickname = '', persona = '' } = props
    const t = useI18N()
    const { classes } = useStyles({ disabled: !owner })

    const { value: _avatar, loading } = usePersonaNFTAvatar(
        userId,
        Twitter.getAvatarId(avatar) ?? '',
        persona,
        RSS3_KEY_SNS.TWITTER,
    )

    const tokenDetailed: AllChainsNonFungibleToken = useMemo(
        () => ({
            tokenId: _avatar?.tokenId ?? '',
            contract: {
                chainId: _avatar?.chainId ?? ChainId.Mainnet,
                name: '',
                symbol: '',
                address: _avatar?.address ?? '',
                schema: SchemaType.ERC721,
                owner: '',
            },
            metadata: {
                chainId: _avatar?.chainId ?? ChainId.Mainnet,
                name: '',
                symbol: '',
            },
            id: _avatar?.address ?? '',
            chainId: _avatar?.chainId ?? ChainId.Mainnet,
            type: TokenType.NonFungible,
            schema: SchemaType.ERC721,
            address: _avatar?.address ?? '',
        }),
        [_avatar],
    )

    const onClick = useCallback(() => {
        if (!proof) return
        onSelect?.(proof, _avatar ? tokenDetailed : undefined)
    }, [_avatar, proof])

    const inactive = !owner || !proof

    return (
        <ListItemButton className={classes.root} onClick={onClick} disabled={inactive}>
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
                loading={loading}
                tooltip={inactive ? t.inactive_persona_tooltip() : ''}
                isNFT={Boolean(_avatar)}
            />

            <MoreIcon style={{ marginLeft: 8 }} />
        </ListItemButton>
    )
}
