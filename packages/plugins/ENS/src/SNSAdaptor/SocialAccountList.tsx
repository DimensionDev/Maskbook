import { useMenuConfig } from '@masknet/shared'
import { useWindowScroll } from 'react-use'
import { useEffect } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography, MenuItem } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { openWindow } from '@masknet/shared-base-ui'
import { NextIdBadge } from './NextIdBadge'
import type { BindingProof } from '@masknet/shared-base'
import useStyles from './useStyles'
import { useI18N } from '../locales'

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
