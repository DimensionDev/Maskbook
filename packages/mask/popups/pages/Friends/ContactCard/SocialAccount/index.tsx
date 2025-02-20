import { Icons } from '@masknet/icons'
import { EnhanceableSite, twitterDomainMigrate } from '@masknet/shared-base'
import { makeStyles, TextOverflowTooltip } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import { Box, Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { AccountAvatar } from '../../../Personas/components/AccountAvatar/index.js'

interface SocialAccountProps {
    avatar?: string
    userId: string
    site: EnhanceableSite
}

const useStyles = makeStyles()((theme) => ({
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        width: 30,
        height: 30,
        alignItems: 'center',
    },
    userId: {
        display: 'flex',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '18px',
    },
    name: {
        flexGrow: 1,
        minWidth: 0,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export const SocialAccount = memo<SocialAccountProps>(function SocialAccount({ avatar, userId, site }) {
    const isOnTwitter = site === EnhanceableSite.Twitter
    const { data: twitterAvatar = avatar } = useQuery({
        enabled: isOnTwitter && !avatar,
        queryKey: ['social-account-avatar', site, avatar, userId],
        queryFn: async () => {
            const userInfo = await FireflyTwitter.getUserInfo(userId)
            return userInfo?.legacy.profile_image_url_https
        },
    })
    const userAvatar = isOnTwitter ? twitterAvatar : avatar
    const { classes } = useStyles()
    const name = `@${userId}`
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            <AccountAvatar
                avatar={userAvatar}
                network={site}
                isValid
                classes={{ avatar: classes.avatar, container: classes.avatar }}
            />
            <Box className={classes.userId}>
                <TextOverflowTooltip title={name}>
                    <span className={classes.name}>{name}</span>
                </TextOverflowTooltip>
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={twitterDomainMigrate(`https://${site}/${userId}`)}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
