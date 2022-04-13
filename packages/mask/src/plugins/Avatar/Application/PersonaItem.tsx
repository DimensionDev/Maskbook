import { makeStyles } from '@masknet/theme'
import { Box, Typography, CircularProgress } from '@mui/material'
import { NFTAvatar } from './NFTAvatar'
import { NFTInfo } from './NFTInfo'
import { MoreIcon } from '../assets/more'
import { useNFTAvatar } from '../hooks'
import { RSS3_KEY_SNS } from '../constants'
import { useCheckTokenOwner, useTokenOwner } from '../hooks/useTokenOwner'

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
    onClick?: (token?: { address?: string; tokenId?: string }) => void
}

export function PersonaItem(props: PersonaItemProps) {
    const { avatar, userId, nickname, onClick, owner = false } = props
    const { classes } = useStyles({ disabled: !owner })
    const { value: _avatar, loading } = useNFTAvatar(userId, RSS3_KEY_SNS.TWITTER)
    const { value: token, loading: loadingToken } = useTokenOwner(_avatar?.address ?? '', _avatar?.tokenId ?? '')
    const { loading: loadingCheckOwner, isOwner } = useCheckTokenOwner(token?.owner)

    return (
        <div
            className={classes.root}
            onClick={() => onClick?.({ address: _avatar?.address, tokenId: _avatar?.tokenId })}>
            <>
                <NFTAvatar avatar={avatar} hasBorder />
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
                            _avatar && token && isOwner
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
