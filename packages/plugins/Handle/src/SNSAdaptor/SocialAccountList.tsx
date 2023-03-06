import { useMenuConfig } from '@masknet/shared'
import { useWindowScroll } from 'react-use'
import { useEffect, useRef, useState } from 'react'
import { resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { debounce } from 'lodash-es'
import { Box, Typography, MenuItem, alpha } from '@mui/material'
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material'
import { openWindow } from '@masknet/shared-base-ui'
import type { BindingProof } from '@masknet/web3-shared-base'
import { SocialTooltip } from './SocialTooltip.js'
import { makeStyles } from '@masknet/theme'
import { resolveNextIDPlatformIcon } from './utils.js'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isMenuScroll = false }) => {
    return {
        socialName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 400,
            marginLeft: 4,
            fontSize: 14,
        },
        more: {
            height: 36,
            width: 36,
            borderRadius: 8,
            background: alpha(theme.palette.common.white, 0.5),
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        socialAccountListItem: {
            width: 193,
            padding: '12px 6px',
            margin: isMenuScroll ? '6px 0 6px 12px' : '6px 12px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 12,
            color: theme.palette.maskColor.dark,
            '&:hover': {
                background: theme.palette.maskColor.publicBg,
            },
        },
        menuItemNextIdIcon: {
            display: 'flex',
            marginLeft: 'auto',
        },
        accountNameInList: {
            maxWidth: 120,
            color: theme.palette.maskColor.dark,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        menu: {
            maxHeight: 296,
            background: theme.palette.maskColor.white,
            scrollbarColor: `${theme.palette.maskColor.secondaryLine} ${theme.palette.maskColor.secondaryLine}`,
            scrollbarWidth: 'thin',
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 19,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 4,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.maskColor.secondaryLine,
                backgroundClip: 'padding-box',
            },
        },
        linkOutIcon: {
            cursor: 'pointer',
        },
    }
})

interface SocialAccountListProps {
    nextIdBindings: BindingProof[]
}

export function SocialAccountList({ nextIdBindings }: SocialAccountListProps) {
    const { classes, cx } = useStyles({ isMenuScroll: nextIdBindings.length > 5 })
    const position = useWindowScroll()
    const [hideToolTip, setHideToolTip] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleEndScroll = debounce(() => setHideToolTip(false), 300)

        const onScroll = () => {
            setHideToolTip(true)
            handleEndScroll()
        }

        const menu = ref.current?.querySelector('[role="menu"]')?.parentElement
        menu?.addEventListener('scroll', onScroll)
        return () => menu?.removeEventListener('scroll', onScroll)
    }, [ref.current, nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        nextIdBindings.map((x, i) => (
            <SocialTooltip key={i} platform={x.source} hidden={hideToolTip}>
                <MenuItem
                    className={classes.socialAccountListItem}
                    disabled={false}
                    onClick={() => openWindow(resolveNextIDPlatformLink(x.platform, x.identity))}>
                    {resolveNextIDPlatformIcon(x.platform)}
                    <Typography className={cx(classes.socialName, classes.accountNameInList)}>{x.identity}</Typography>
                    <div className={classes.menuItemNextIdIcon}>
                        <Icons.LinkOut size={20} className={classes.linkOutIcon} />
                    </div>
                </MenuItem>
            </SocialTooltip>
        )),
        {
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            PaperProps: {
                className: classes.menu,
            },
        },
        ref,
    )

    useEffect(closeMenu, [position])

    return (
        <>
            <Box onClick={openMenu} className={classes.more}>
                <MoreHorizIcon />
            </Box>
            {menu}
        </>
    )
}
