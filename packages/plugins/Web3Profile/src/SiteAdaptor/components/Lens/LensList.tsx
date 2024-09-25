import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, PersistentStorages } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { List, ListItem, Typography, type ListProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { compact, first } from 'lodash-es'
import { useSubscription } from 'use-subscription'
import { Trans } from '@lingui/macro'

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
        avatarContainer: {
            width: 30,
            height: 30,
            position: 'relative',
        },
        imageContainer: {
            borderRadius: '50%',
            overflow: 'hidden',
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
    accounts: FireflyConfigAPI.LensAccount[]
}

export const LensList = memo(({ className, accounts, ...rest }: Props) => {
    const { classes, cx } = useStyles()
    const { account: wallet } = useChainContext()

    const latestProfile = useSubscription(PersistentStorages.Settings.storage.latestLensProfile.subscription)

    const { data: currentProfileId = latestProfile } = useQuery({
        queryKey: ['lens', 'current-profile', wallet],
        enabled: !latestProfile,
        queryFn: async () => {
            const currentProfileId = (await Lens.queryDefaultProfileByAddress(wallet))?.id
            if (!currentProfileId) {
                const profiles = await Lens.queryProfilesByAddress(wallet)
                return first(profiles)?.id || null
            }
            return currentProfileId
        },
    })

    const { data = accounts, isPending } = useQuery({
        queryKey: ['lens', 'popup-list', currentProfileId, accounts.map((x) => x.handle).join('')],
        queryFn: async () => {
            if (!accounts.length) return EMPTY_LIST

            const profiles = await Lens.getProfilesByHandles(accounts.map((x) => x.handle))
            if (!currentProfileId)
                return compact(
                    profiles.map((profile) => {
                        const target = accounts.find((x) => x.handle.replace('.lens', '') === profile.handle.localName)
                        if (!target) return
                        return {
                            ...target,
                            ownedBy: profile.ownedBy.address,
                        }
                    }),
                )

            const followStatusList = await Lens.queryFollowStatusList(
                currentProfileId,
                profiles.map((x) => x.id),
            )
            return compact(
                profiles.map((profile) => {
                    const target = accounts.find((x) => x.handle.replace('.lens', '') === profile.handle.localName)
                    if (!target) return
                    return {
                        ...target,
                        ownedBy: profile.ownedBy.address,
                        isFollowing: followStatusList?.find((x) => x.profileId === profile.id)?.status.value,
                    }
                }),
            )
        },

        refetchOnWindowFocus: false,
    })

    return (
        <List className={cx(classes.list, className)} {...rest}>
            {data.map((account, key) => {
                return <LensListItem account={account} key={key} loading={isPending} />
            })}
        </List>
    )
})

LensList.displayName = 'LensList'

interface LensListItemProps {
    account: FireflyConfigAPI.LensAccount
    loading: boolean
}

const LensListItem = memo<LensListItemProps>(({ account, loading }) => {
    const { classes } = useStyles()
    const { account: wallet } = useChainContext()
    const profileUri = account.profileUri.filter(Boolean)
    const lensIcon = <Icons.Lens size={30} />

    return (
        <ListItem className={classes.listItem} key={account.handle}>
            <div className={classes.avatarContainer}>
                {profileUri.length ?
                    <Image
                        size={30}
                        classes={{ failed: classes.avatar, container: classes.imageContainer }}
                        src={profileUri[0]}
                        fallback={lensIcon}
                    />
                :   lensIcon}
                <Icons.DarkLens className={classes.badge} size={12} />
            </div>
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
                {isSameAddress(wallet, account.ownedBy) ?
                    <Trans>View</Trans>
                : account.isFollowing ?
                    <Trans>Following</Trans>
                :   <Trans>Follow</Trans>}
            </ActionButton>
        </ListItem>
    )
})

LensListItem.displayName = 'LensListItem'
