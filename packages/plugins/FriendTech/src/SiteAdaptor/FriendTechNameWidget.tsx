import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import { memo, useCallback, useEffect, type MouseEvent } from 'react'
import { useUserInfo } from './hooks/useUserInfo.js'
import { viewUser } from './emitter.js'
import { Box, Typography } from '@mui/material'
import { formatBalance } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { useUser } from './hooks/useUser.js'
import { ProgressiveText } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    bar: {
        padding: '2px 4px',
        height: 20,
        boxSizing: 'border-box',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        margin: theme.spacing(0.5, 0),
    },
    icon: {
        filter: 'drop-shadow(0px 6px 12px rgba(1, 186, 250, 0.20))',
    },
    text: {
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
    },
}))

interface Props extends Plugin.SiteAdaptor.NameWidgetOptions {}

export const FriendTechNameWidget = memo(function FriendTechNameWidget({ userId, slot, onStatusUpdate }: Props) {
    const { classes, theme } = useStyles()
    const { data: userInfo } = useUserInfo(userId)
    const disabled = !userInfo
    useEffect(() => {
        onStatusUpdate?.(disabled)
    }, [disabled])
    const isSidebar = slot === Plugin.SiteAdaptor.NameWidgetSlot.Sidebar
    const { data: user, isInitialLoading: loadingUser } = useUser(isSidebar ? userInfo?.address : undefined)

    const handleClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            viewUser(userInfo?.address)
        },
        [userInfo?.address],
    )
    if (!userInfo) return null

    if (isSidebar) {
        return (
            <Box role="button" className={classes.bar} onClick={handleClick}>
                <Icons.FriendTech className={classes.icon} size={16} />
                <Icons.Medal size={16} />
                <ProgressiveText loading={loadingUser} skeletonWidth={30} className={classes.text}>
                    {user?.rank || '-'}
                </ProgressiveText>
                <Icons.ETHSymbol size={16} color={theme.palette.maskColor.second} />
                <Typography className={classes.text}>{formatBalance(userInfo.displayPrice, 18)}</Typography>
            </Box>
        )
    }

    return <Icons.FriendTech size={18} onClick={handleClick} />
})
