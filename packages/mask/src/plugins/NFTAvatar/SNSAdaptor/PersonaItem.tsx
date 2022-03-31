import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { NFTAvatar } from './NFTAvatar'
import { NFTInfo } from './NFTInfo'
import { MoreIcon } from '../assets/more'

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
    disabled?: boolean
    avatar?: string
    userId?: string
    nickname?: string
    onClick: () => void
}

export function PersonaItem(props: PersonaItemProps) {
    const { avatar, userId, nickname, onClick, disabled = false } = props
    const { classes } = useStyles({ disabled })
    const nft = {
        symbol: 'CSM',
        address: '1111',
        name: 'test',
        tokenId: '123431431431',
    }
    return (
        <div className={classes.root} onClick={onClick}>
            <NFTAvatar avatar={avatar} hasBorder />
            <Box className={classes.userInfo}>
                <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                    {nickname}
                </Typography>
                <Typography variant="body1" color="textSecondary" fontSize={12}>
                    @{userId}
                </Typography>
            </Box>
            <NFTInfo nft={nft} />
            <MoreIcon />
        </div>
    )
}
