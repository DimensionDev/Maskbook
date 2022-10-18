import { useMenuConfig } from '@masknet/shared'
import { useWindowScroll } from 'react-use'
import { useEffect } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography, MenuItem } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { openWindow } from '@masknet/shared-base-ui'
import { NextIdBadge } from './NextIdBadge'
import type { BindingProof } from '@masknet/shared-base'
import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isMenuScroll = false }) => {
    return {
        nextIdVerifiedTwitterName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            marginLeft: 4,
            fontSize: 16,
        },
        more: {
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
            '&:hover': {
                background: theme.palette.background.default,
            },
        },
        menuItemNextIdIcon: {
            display: 'flex',
            marginLeft: 'auto',
        },
        accountNameInList: {
            maxWidth: 120,
            color: theme.palette.text.primary,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        menu: {
            maxHeight: 296,
            background: theme.palette.maskColor.bottom,
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
    }
})

interface SocialAccountListProps {
    validNextIdTwitterBindings: BindingProof[]
}

export function SocialAccountList({ validNextIdTwitterBindings }: SocialAccountListProps) {
    const t = useI18N()
    const { classes, cx, theme } = useStyles({ isMenuScroll: validNextIdTwitterBindings.length > 5 })
    const position = useWindowScroll()
    const [menu, openMenu, closeMenu] = useMenuConfig(
        validNextIdTwitterBindings.map((x, i) => (
            <MenuItem
                className={classes.socialAccountListItem}
                disabled={false}
                key={i}
                onClick={() => openWindow(`https://twitter.com/${x.identity}`)}>
                <Icons.TwitterRoundWithNoBorder width={20} height={20} />
                <Typography className={cx(classes.nextIdVerifiedTwitterName, classes.accountNameInList)}>
                    {x.identity}
                </Typography>
                <div className={classes.menuItemNextIdIcon}>
                    <NextIdBadge />
                </div>
            </MenuItem>
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
