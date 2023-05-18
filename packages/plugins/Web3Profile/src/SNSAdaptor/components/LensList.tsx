import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { List, ListItem, Typography, type ListProps } from '@mui/material'
import { memo, type FC } from 'react'
import { useI18N } from '../../locales/i18n_generated.js'
import { useAsync } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        list: {
            backgroundColor: isDark ? '#030303' : theme.palette.common.white,
            maxWidth: 320,
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
        avatar: {
            borderRadius: '50%',
        },
        name: {
            color: theme.palette.maskColor.main,
            fontWeight: 400,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(2),
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            flexGrow: 1,
        },
        followButton: {
            marginLeft: 'auto',
            height: 32,
            minWidth: 64,
            padding: theme.spacing(1, 1.5),
            backgroundColor: '#ABFE2C',
            color: theme.palette.common.black,
            borderRadius: 99,
            fontSize: '12px',
            '&:hover': {
                backgroundColor: '#ABFE2C',
                color: theme.palette.common.black,
            },
        },
    }
})
interface Props extends ListProps {
    accounts: FireflyBaseAPI.LensAccount[]
}

export const LensList: FC<Props> = memo(({ className, accounts, ...rest }) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <List className={cx(classes.list, className)} {...rest}>
            {accounts.map((account, key) => {
                return <LensListItem account={account} key={key} />
            })}
        </List>
    )
})

LensList.displayName = 'LensList'

interface LensListItemProps {
    account: FireflyBaseAPI.LensAccount
}

const LensListItem = memo<LensListItemProps>(({ account }) => {
    const { classes } = useStyles()
    const { account: wallet } = useChainContext()
    const t = useI18N()
    const profileUri = account.profileUri.filter(Boolean)
    const lensIcon = <Icons.Lens size={20} />

    const { loading, value } = useAsync(async () => {
        const profile = await Lens.getProfileByHandle(account.handle)
        const isFollowing = await Lens.queryFollowStatus(wallet, profile.id)

        return {
            ownedBy: profile.ownedBy,
            isFollowing,
        }
    }, [account, wallet])

    return (
        <ListItem className={classes.listItem} key={account.handle}>
            {profileUri.length ? (
                <Image size={20} src={profileUri[0]} className={classes.avatar} fallback={lensIcon} />
            ) : (
                lensIcon
            )}
            <Typography className={classes.name}>{account.name || account.handle}</Typography>
            <ActionButton
                variant="text"
                loading={loading}
                className={classes.followButton}
                disableElevation
                onClick={() => {
                    CrossIsolationMessages.events.followLensDialogEvent.sendToLocal({
                        open: true,
                        handle: account.handle,
                    })
                }}>
                {isSameAddress(wallet, value?.ownedBy)
                    ? t.view()
                    : value?.isFollowing
                    ? t.following_action()
                    : t.follow()}
            </ActionButton>
        </ListItem>
    )
})

LensListItem.displayName = 'LensListItem'
