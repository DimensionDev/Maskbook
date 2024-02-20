import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { List, ListItem, Typography, type ListProps, Link } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        list: {
            backgroundColor: isDark ? '#030303' : theme.palette.common.white,
            maxWidth: 250,
            // Show up to 6 item
            maxHeight: 244,
            overflow: 'auto',
            minWidth: 240,
            padding: theme.spacing(1.5),
            boxSizing: 'border-box',
            borderRadius: 16,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        listItem: {
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5),
            height: 40,
            marginBottom: 6,
            borderRadius: 4,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.bg,
            },
            '&:last-of-type': {
                marginBottom: 0,
            },
        },
        avatarContainer: {
            width: 30,
            height: 30,
            borderRadius: '50%',
            position: 'relative',
        },
        avatar: {
            borderRadius: '50%',
        },
        badge: {
            border: `1px solid ${theme.palette.maskColor.bg}`,
            borderRadius: '50%',
            position: 'absolute',
            right: -3,
            bottom: -3,
        },
        name: {
            color: theme.palette.maskColor.main,
            fontWeight: 400,
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.maskColor.main,
        },
    }
})
interface Props extends ListProps {
    accounts: FireflyConfigAPI.FarcasterProfile[]
}

export const FarcasterList = memo(({ className, accounts, ...rest }: Props) => {
    const { classes, cx } = useStyles()

    return (
        <List className={cx(classes.list, className)} {...rest}>
            {accounts.map((account, key) => {
                return <FarcasterListItem account={account} key={key} />
            })}
        </List>
    )
})

FarcasterList.displayName = 'FarcasterList'

interface FarcasterListItemProps {
    account: FireflyConfigAPI.FarcasterProfile
}

const FarcasterListItem = memo<FarcasterListItemProps>(({ account }) => {
    const { classes } = useStyles()
    const profileUri = `https://firefly.mask.social/profile/farcaster/${account.fid}`
    const farcasterIcon = <Icons.Farcaster size={30} />

    return (
        <ListItem className={classes.listItem} key={account.fid}>
            <div className={classes.avatarContainer}>
                {profileUri.length ?
                    <Image
                        size={30}
                        src={account.avatar.url}
                        classes={{ failed: classes.avatar }}
                        className={classes.avatar}
                        fallback={farcasterIcon}
                    />
                :   farcasterIcon}
                <Icons.Farcaster className={classes.badge} size={12} />
            </div>
            <Typography className={classes.name}>{account.display_name || account.username}</Typography>
            <Link href={profileUri} target="_blank" className={classes.link}>
                <Icons.LinkOut size={20} />
            </Link>
        </ListItem>
    )
})

FarcasterListItem.displayName = 'FarcasterListItem'
