import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Stack } from '@mui/material'
import { RainbowBox } from '../SiteAdaptor/RainbowBox.js'

const useStyles = makeStyles()({
    indicator: {
        position: 'absolute',
        top: 2,
        right: 6,
        width: 7,
        height: 7,
        backgroundColor: '#3DC233',
        boxSizing: 'border-box',
        border: '1px solid #fff',
        borderRadius: '50%',
    },
})

interface NFTAvatarProps {
    isOwner?: boolean
    hasBorder: boolean
    platform?: string
    avatar?: string
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { avatar, hasBorder, isOwner = false } = props
    const { classes } = useStyles()

    return (
        <Stack position="relative">
            {hasBorder ?
                <RainbowBox>
                    <Avatar src={avatar} />
                </RainbowBox>
            :   <Box style={{ border: '2px solid transparent' }}>
                    <Avatar src={avatar} />
                </Box>
            }
            <Stack
                sx={{
                    position: 'absolute',
                    right: -3,
                    bottom: 0,
                    overflow: 'hidden',
                    borderRadius: '100%',
                    backgroundColor: 'white',
                    padding: '1px',
                }}>
                <Icons.TwitterXRound size={14} />
            </Stack>
            {isOwner ?
                <div className={classes.indicator} />
            :   null}
        </Stack>
    )
}
