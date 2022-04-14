import { makeStyles } from '@masknet/theme'
import { Box, Typography, CircularProgress } from '@mui/material'
import { NFTAvatar } from './NFTAvatar'
import { NFTInfo } from './NFTInfo'
import { MoreIcon } from '../assets/more'
import { useNFTAvatar } from '../hooks'
import { RSS3_KEY_SNS } from '../constants'
import { useCheckTokenOwner, useTokenOwner } from '../hooks/useTokenOwner'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../../../social-network-adaptor/twitter.com/utils/user'
import type { TokenInfo } from '../types'
import { useCallback } from 'react'

const useStyles = makeStyles<{ disabled: boolean }>()((theme, props) => ({
    root: {
        margin: theme.spacing(0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: {},
    userInfo: {
        fontSize: 14,
        marginLeft: 16,
        flex: 1,
    },
}))

interface PersonaItemProps {
    owner?: boolean
    avatar?: string
    userId: string
    nickname?: string
    platform?: string
    onSelect?: (tokenInfo: TokenInfo) => void
}

export function PersonaItem(props: PersonaItemProps) {
    const currentIdentity = useLastRecognizedIdentity()
    const { avatar, userId, nickname, onSelect, owner = false, platform } = props
    const { classes } = useStyles({ disabled: !owner })
    const { value: _avatar, loading } = useNFTAvatar(userId.toLowerCase(), RSS3_KEY_SNS.TWITTER)
    const { value: token, loading: loadingToken } = useTokenOwner(_avatar?.address ?? '', _avatar?.tokenId ?? '')
    const { loading: loadingCheckOwner, isOwner } = useCheckTokenOwner(token?.owner)

    const haveNFT = Boolean(
        _avatar && token && isOwner && _avatar.avatarId === getAvatarId(currentIdentity.avatar ?? ''),
    )

    const onClick = useCallback(() => {
        if (!_avatar) return
        onSelect?.({ address: _avatar?.address, tokenId: _avatar?.tokenId })
    }, [_avatar])
    return (
        <div className={classes.root} onClick={onClick}>
            <>
                <NFTAvatar avatar={avatar} hasBorder={haveNFT} platform={platform} />
                <Box className={classes.userInfo}>
                    <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                        {nickname}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" fontSize={12}>
                        @{userId}
                    </Typography>
                </Box>
                {loading || loadingToken || loadingCheckOwner ? (
                    <CircularProgress size="small" />
                ) : (
                    <NFTInfo
                        owner={isOwner}
                        nft={
                            haveNFT
                                ? {
                                      name: token?.name ?? '',
                                      symbol: token?.symbol ?? '',
                                      tokenId: _avatar?.tokenId ?? '',
                                      address: _avatar?.address ?? '',
                                  }
                                : undefined
                        }
                    />
                )}
                <MoreIcon />
            </>
        </div>
    )
}
