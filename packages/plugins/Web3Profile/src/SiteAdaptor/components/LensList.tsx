import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { List, ListItem, Typography, type ListProps } from '@mui/material'
import { memo } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { compact, first } from 'lodash-es'
import { useI18N } from '../../locales/i18n_generated.js'

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

export const LensList = memo(({ className, accounts, ...rest }: Props) => {
    const { classes, cx } = useStyles()
    const { account: wallet } = useChainContext()

    const { data = accounts, isLoading } = useQuery({
        queryKey: ['Lens', 'Popup-List', accounts.map((x) => x.handle).join(''), wallet],
        queryFn: async () => {
            if (!accounts.length) return EMPTY_LIST
            let currentProfile = await Lens.queryDefaultProfileByAddress(wallet)
            if (!currentProfile?.id) {
                const profiles = await Lens.queryProfilesByAddress(wallet)
                currentProfile = first(profiles)
            }

            const profiles = await Lens.getProfilesByHandles(accounts.map((x) => x.handle))
            if (!currentProfile?.id)
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
                currentProfile.id,
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
                return <LensListItem account={account} key={key} loading={isLoading} />
            })}
        </List>
    )
})

LensList.displayName = 'LensList'

interface LensListItemProps {
    account: FireflyBaseAPI.LensAccount
    loading: boolean
}

const LensListItem = memo<LensListItemProps>(({ account, loading }) => {
    const { classes } = useStyles()
    const { account: wallet } = useChainContext()
    const t = useI18N()
    const profileUri = account.profileUri.filter(Boolean)
    const lensIcon = <Icons.Lens size={20} />

    return (
        <ListItem className={classes.listItem} key={account.handle}>
            {profileUri.length ?
                <Image size={20} src={profileUri[0]} className={classes.avatar} fallback={lensIcon} />
            :   lensIcon}
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
                    t.view()
                : account?.isFollowing ?
                    t.following_action()
                :   t.follow()}
            </ActionButton>
        </ListItem>
    )
})

LensListItem.displayName = 'LensListItem'
