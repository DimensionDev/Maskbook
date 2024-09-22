import { memo, useCallback, useSyncExternalStore } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, ListItemButton } from '@mui/material'
import type { BindingProof } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TokenType } from '@masknet/web3-shared-base'
import { AvatarStore, Twitter } from '@masknet/web3-providers'
import { Icons } from '@masknet/icons'
import { NFTAvatar } from './NFTAvatar.js'
import { NFTInfo } from './NFTInfo.js'
import type { AllChainsNonFungibleToken } from '../types.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
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
        marginLeft: 16,
        flex: 1,
    },
}))

interface PersonaItemProps {
    isOwner?: boolean
    avatarUrl?: string
    userId: string
    nickname?: string
    proof?: BindingProof
    persona?: string
    onSelect?: (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => void
}

export const PersonaItem = memo(function PersonaItem(props: PersonaItemProps) {
    const { userId, onSelect, isOwner = false, proof, avatarUrl, nickname = '', persona = '' } = props
    const { classes } = useStyles()

    const store = useSyncExternalStore(AvatarStore.subscribe, AvatarStore.getSnapshot)
    const avatar = store.retrieveAvatar(userId, Twitter.getAvatarId(avatarUrl), persona)

    const handleSelect = useCallback(() => {
        if (!proof || !onSelect) return
        if (!avatar) return onSelect(proof)
        const tokenDetailed: AllChainsNonFungibleToken = {
            tokenId: avatar.tokenId,
            contract: {
                chainId: avatar.chainId ?? ChainId.Mainnet,
                name: '',
                symbol: '',
                address: avatar.address,
                schema: SchemaType.ERC721,
                owner: '',
            },
            metadata: {
                chainId: avatar.chainId ?? ChainId.Mainnet,
                name: '',
                symbol: '',
            },
            id: avatar.address,
            chainId: avatar.chainId ?? ChainId.Mainnet,
            type: TokenType.NonFungible,
            schema: SchemaType.ERC721,
            address: avatar.address,
        }
        onSelect(proof, tokenDetailed)
    }, [avatar, proof, onSelect])

    const inactive = !isOwner || !proof

    return (
        <ListItemButton className={classes.root} onClick={handleSelect} disabled={inactive}>
            <NFTAvatar
                isOwner={isOwner}
                avatar={avatarUrl || avatar?.imageUrl}
                hasBorder={!!avatar}
                platform={proof?.platform}
            />
            <Box className={classes.userInfo}>
                <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                    {nickname || avatar?.nickname}
                </Typography>
                <Typography variant="body1" color="textSecondary" fontSize={12}>
                    @{userId}
                </Typography>
            </Box>

            <NFTInfo
                tooltip={
                    inactive ?
                        <Trans>Not current account. Please switch to this account to set up NFTs Profile.</Trans>
                    :   ''
                }
                isNFT={!!avatar}
            />

            <Icons.RightArrow sx={{ color: (theme) => theme.palette.maskColor.borderSecondary, marginLeft: '8px' }} />
        </ListItemButton>
    )
})
