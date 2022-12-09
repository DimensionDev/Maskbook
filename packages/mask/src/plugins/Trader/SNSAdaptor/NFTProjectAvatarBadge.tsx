import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { DataProvider } from '@masknet/public-api'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { PluginTraderMessages } from '../messages.js'
import { IconButton, IconButtonProps } from '@mui/material'
import { FC, useEffect, useRef } from 'react'

const useStyles = makeStyles()((theme) => ({
    badge: {
        padding: 0,
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

interface Props extends IconButtonProps {
    address: string
    userId: string
}
export const NFTProjectAvatarBadge: FC<Props> = ({ address, userId, className, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return

        let openTimer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(openTimer)

            const button = buttonRef.current
            if (!button) return
            openTimer = setTimeout(() => {
                PluginTraderMessages.cashAnchorObserved.sendToLocal({
                    name: userId,
                    address,
                    type: TrendingAPI.TagType.HASH,
                    isNFTProjectPopper: true,
                    element: button,
                    dataProviders: [DataProvider.NFTScan],
                })
            }, 200)
        }

        button.addEventListener('mouseenter', enter)

        return () => {
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
        }
    }, [address, userId])

    return (
        <IconButton disableRipple className={cx(classes.badge, className)} {...rest} ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
