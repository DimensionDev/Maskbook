import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount, SocialIdentity } from '@masknet/shared-base'

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
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
}

export function ProfileCover() {
    const { classes } = useStyles()

    return (
        <div className={classes.root}>
            <Typography>Render By Mask Plugin</Typography>
        </div>
    )
}
