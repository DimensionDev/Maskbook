import { useMenuConfig } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Box, Typography, MenuItem } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { openWindow } from '@masknet/shared-base-ui'
import { NextIdBadge } from './NextIdBadge'
import type { BindingProof } from '@masknet/shared-base'
import useStyles from './useStyles'
import { useI18N } from '../locales'

interface SocialAccountListProps {
    restOfValidNextIdTwitterBindings: BindingProof[]
}

export function SocialAccountList({ restOfValidNextIdTwitterBindings }: SocialAccountListProps) {
    const t = useI18N()
    const { classes, cx } = useStyles()

    const [menu, openMenu] = useMenuConfig(
        restOfValidNextIdTwitterBindings.map((x, i) => (
            <MenuItem
                className={classes.socialAccountListItem}
                disabled={false}
                key={i}
                onClick={() => openWindow(`https://twitter.com/${x.identity}`)}>
                <Icons.TwitterRound />
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
                style: { maxHeight: 296 },
            },
        },
    )

    return (
        <>
            <Box onClick={openMenu} className={classes.more}>
                <MoreHorizIcon />
            </Box>
            {menu}
        </>
    )
}
