import { evmAddress } from '@lens-protocol/client'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Image, useLensClient, useMyLensAccount } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ListItem, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        listItem: {
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5),
            height: 40,
            marginBottom: 6,
            borderRadius: 4,
            '&:hover': {
                backgroundColor: theme.vars.palette.maskColor.bg,
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
            border: `1px solid ${theme.vars.palette.maskColor.bg}`,
            borderRadius: '50%',
            position: 'absolute',
            right: -3,
            bottom: -3,
        },
        name: {
            color: theme.vars.palette.maskColor.main,
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
            color: theme.vars.palette.common.black,
            borderRadius: 99,
            fontSize: '12px',
            '&:hover': {
                backgroundColor: '#ABFE2C',
                color: theme.vars.palette.common.black,
            },
        },
    }
})
interface Props {
    accounts: FireflyConfigAPI.LensAccount[]
}

export const LensList = memo(function LensList({ accounts }: Props) {
    const lensV3 = useLensClient()
    const myLensAccount = useMyLensAccount()
    const myLensAddress = myLensAccount?.account.address

    const { data = accounts, isPending } = useQuery({
        queryKey: ['lens', 'popup-list', myLensAddress, accounts.map((x) => x.handle).join('')],
        queryFn: async () => {
            if (!accounts.length) return EMPTY_LIST
            if (!lensV3) return accounts

            const nativeAccounts = await lensV3.getAccountsByHandles(accounts.map((x) => x.handle))
            if (!myLensAddress && nativeAccounts?.length)
                return compact(
                    nativeAccounts.map((nativeAccount) => {
                        const target = accounts.find(
                            (x) => x.handle.replace(/\.lens$/u, '') === nativeAccount.username?.localName,
                        )
                        if (!target) return
                        return {
                            ...target,
                            address: nativeAccount.address,
                            ownedBy: nativeAccount.username?.ownedBy as string,
                        }
                    }),
                )

            if (!nativeAccounts?.length) return accounts
            const followStatus = await lensV3.getFollowStatus(
                (myLensAddress ? nativeAccounts || [] : []).map((x) => ({
                    follower: evmAddress(myLensAddress!),
                    account: evmAddress(x.address),
                })),
            )
            return compact(
                nativeAccounts.map((nativeAccount) => {
                    const target = accounts.find(
                        (x) => x.handle.replace(/\.lens$/u, '') === nativeAccount.username?.localName,
                    )
                    if (!target) return
                    const status = followStatus.find((x) =>
                        isSameAddress(x.account, nativeAccount.address),
                    )?.isFollowing
                    return {
                        ...target,
                        address: nativeAccount.address,
                        ownedBy: nativeAccount.username?.ownedBy as string,
                        isFollowing: status?.optimistic || status?.onChain,
                    }
                }),
            )
        },

        refetchOnWindowFocus: false,
    })

    return (
        <>
            {data.map((account, key) => {
                return <LensListItem account={account} key={key} loading={isPending} />
            })}
        </>
    )
})

interface LensListItemProps {
    account: FireflyConfigAPI.LensAccount
    loading: boolean
}

const LensListItem = memo<LensListItemProps>(function LensListItem({ account, loading }) {
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
