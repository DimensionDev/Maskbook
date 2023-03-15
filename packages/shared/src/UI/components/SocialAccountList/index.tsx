import { useMenuConfig } from '@masknet/shared'
import { useWindowScroll } from 'react-use'
import { HTMLProps, useEffect, useRef, useState } from 'react'
import { resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { debounce } from 'lodash-es'
import { Typography, MenuItem, Button, alpha } from '@mui/material'
import { openWindow } from '@masknet/shared-base-ui'
import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { SocialTooltip } from './SocialTooltip.js'
import { makeStyles } from '@masknet/theme'
import { resolveNextIDPlatformIcon } from './utils.js'
import { isNonNull } from '@masknet/kit'

const useStyles = makeStyles()((theme) => {
    return {
        socialName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 400,
            marginLeft: 4,
            fontSize: 14,
        },
        iconStack: {
            height: 28,
            padding: theme.spacing(0.5),
            boxSizing: 'border-box',
            backgroundColor: alpha(theme.palette.common.white, 0.4),
            borderRadius: 8,
            '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.4),
            },
            '&:active': {
                backgroundColor: alpha(theme.palette.common.white, 0.4),
            },
        },
        icon: {
            marginLeft: '-3.5px',
            ':nth-of-type(1)': {
                zIndex: 3,
            },
            ':nth-of-type(2)': {
                zIndex: 2,
            },
            ':nth-of-type(3)': {
                zIndex: 1,
            },
        },
        socialAccountListItem: {
            padding: '12px 6px',
            margin: '6px 12px',
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
            width: 320,
            maxHeight: 296,
            translate: theme.spacing(1.9, 1),
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
        followButton: {
            marginLeft: 'auto',
            height: 32,
            padding: theme.spacing(1, 2),
            backgroundColor: '#ABFE2C',
            color: theme.palette.maskColor.main,
            borderRadius: 99,
            '&:hover': {},
        },
        linkOutIcon: {
            cursor: 'pointer',
        },
    }
})

interface SocialAccountListProps extends HTMLProps<HTMLDivElement> {
    nextIdBindings: BindingProof[]
}

export function SocialAccountList({ nextIdBindings, ...rest }: SocialAccountListProps) {
    const { classes, cx } = useStyles()
    const position = useWindowScroll()
    const [hideToolTip, setHideToolTip] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleEndScroll = debounce(() => setHideToolTip(false), 3000)

        const onScroll = () => {
            setHideToolTip(true)
            handleEndScroll()
        }

        const menu = ref.current?.querySelector('[role="menu"]')?.parentElement
        menu?.addEventListener('scroll', onScroll)
        return () => menu?.removeEventListener('scroll', onScroll)
    }, [ref.current, nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        nextIdBindings.map((x, i) => {
            const Icon = resolveNextIDPlatformIcon(x.platform)
            return (
                <SocialTooltip key={i} platform={x.source} hidden={hideToolTip}>
                    <MenuItem
                        className={classes.socialAccountListItem}
                        disabled={false}
                        onClick={() => openWindow(resolveNextIDPlatformLink(x.platform, x.identity, x.name))}>
                        {Icon ? <Icon size={20} /> : null}
                        <Typography className={cx(classes.socialName, classes.accountNameInList)}>
                            {x.name || x.identity}
                        </Typography>
                        {x.platform === NextIDPlatform.LENS ? (
                            <Button variant="text" className={classes.followButton} disableElevation>
                                Follow
                            </Button>
                        ) : (
                            <div className={classes.menuItemNextIdIcon}>
                                <Icons.LinkOut size={20} className={classes.linkOutIcon} />
                            </div>
                        )}
                    </MenuItem>
                </SocialTooltip>
            )
        }),
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
        <div {...rest}>
            <Button variant="text" onClick={openMenu} className={classes.iconStack} disableRipple>
                {nextIdBindings
                    .map((x) => resolveNextIDPlatformIcon(x.platform))
                    .filter(isNonNull)
                    .slice(0, 3)
                    .map((Icon, index) => (
                        <Icon key={index} className={classes.icon} size={20} />
                    ))}
            </Button>
            {menu}
        </div>
    )
}
