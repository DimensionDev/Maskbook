import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'

const useStyles = makeStyles()(() => ({
    root: {
        background: `url(${new URL('../../assets/cover.png', import.meta.url).toString()})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
}))

export interface TabContentProps {
    identity?: SocialIdentity
    socialAddressList?: SocialAddress<NetworkPluginID>
}

export function ProfileCover() {
    const { classes } = useStyles()

    return (
        <div className={classes.root}>
            <Typography>Render By Mask Plugin</Typography>
        </div>
    )
}
