import { isNonNull } from '@masknet/kit'
import { useMenuConfig, useSharedI18N } from '@masknet/shared'
import { NextIDPlatform, type BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, type MenuProps } from '@mui/material'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useRef, type HTMLProps } from 'react'
import { useWindowScroll } from 'react-use'
import { resolveNextIDPlatformIcon } from './utils.js'
import { SocialAccountListItem } from './SocialListItem.js'

const useStyles = makeStyles()((theme) => {
    return {
        iconStack: {
            height: 28,
            padding: theme.spacing(0.5),
            boxSizing: 'border-box',
            borderRadius: 8,
            minWidth: 'auto',
            '&:hover': {
                backgroundColor: 'transparent',
            },
            '&:active': {
                backgroundColor: 'transparent',
            },
        },
        icon: {
            marginLeft: '-3.5px',
            ':nth-of-type(1)': {
                zIndex: 2,
                marginLeft: 0,
            },
            ':nth-of-type(2)': {
                zIndex: 1,
            },
            ':nth-of-type(3)': {
                zIndex: 0,
            },
        },
        menu: {
            minWidth: 320,
            maxWidth: 340,
            boxSizing: 'border-box',
            maxHeight: 296,
            borderRadius: 16,
            padding: theme.spacing(1.5),
            translate: theme.spacing(1.9, 1),
            background: theme.palette.maskColor.bottom,
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        menuList: {
            padding: 0,
        },
    }
})

interface SocialAccountListProps extends HTMLProps<HTMLDivElement>, Pick<MenuProps, 'disablePortal'> {
    nextIdBindings: BindingProof[]
}

export function SocialAccountList({ nextIdBindings, disablePortal, ...rest }: SocialAccountListProps) {
    const t = useSharedI18N()
    const { classes, cx } = useStyles()
    const ref = useRef<HTMLDivElement | null>(null)
    const orderedBindings = useMemo(() => {
        return nextIdBindings.sort((a, z) => {
            if (a.platform === z.platform) return 0
            return a.platform === NextIDPlatform.LENS ? -1 : 0
        })
    }, [nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        orderedBindings.map((x, i) => {
            return <SocialAccountListItem key={i} {...x} onClose={() => closeMenu()} />
        }),
        {
            hideBackdrop: true,
            anchorSibling: false,
            disablePortal,
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
            MenuListProps: {
                className: classes.menuList,
                // Remove space for scrollbar
                style: {
                    paddingRight: 0,
                    width: '100%',
                },
            },
        },
        ref,
    )

    const position = useWindowScroll()
    useEffect(closeMenu, [position])

    const platformIcons = useMemo(() => {
        return uniqBy(orderedBindings, (x) => x.platform)
            .map((x) => resolveNextIDPlatformIcon(x.platform))
            .filter(isNonNull)
            .slice(0, 3)
    }, [orderedBindings])

    if (!platformIcons.length) return null

    return (
        <div {...rest}>
            <Button variant="text" onClick={openMenu} className={classes.iconStack} disableRipple>
                {platformIcons.map((Icon, index) => (
                    <Icon key={index} className={classes.icon} size={20} />
                ))}
            </Button>
            {menu}
        </div>
    )
}
