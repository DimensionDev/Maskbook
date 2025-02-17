import { isNonNull } from '@masknet/kit'
import { useMenuConfig } from '@masknet/shared'
import { NextIDPlatform, type Web3BioProfile } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, type MenuProps } from '@mui/material'
import { uniqBy } from 'lodash-es'
import { memo, useEffect, useMemo, useRef, type HTMLProps } from 'react'
import { SocialAccountListItem } from './SocialListItem.js'
import { resolveNextIDPlatformIcon } from './utils.js'

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
        menuPaper: {
            minWidth: 320,
            maxWidth: 340,
            boxSizing: 'border-box',
            borderRadius: 16,
            padding: theme.spacing(2, 1.5),
            translate: theme.spacing(1.9, 1),
            background: theme.palette.maskColor.bottom,
        },
        menuList: {
            padding: 0,
            maxHeight: 296,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

interface SocialAccountListProps
    extends HTMLProps<HTMLDivElement>,
        Pick<MenuProps, 'disablePortal' | 'anchorPosition' | 'anchorReference'> {
    web3bioProfiles: Web3BioProfile[]
    userId?: string
}

export const SocialAccountList = memo(function SocialAccountList({
    web3bioProfiles,
    disablePortal,
    anchorPosition,
    anchorReference,
    userId,
    ...rest
}: SocialAccountListProps) {
    const { classes } = useStyles()
    const ref = useRef<HTMLDivElement | null>(null)

    const [menu, openMenu, closeMenu] = useMenuConfig(
        web3bioProfiles.map((x, i) => {
            const isLens = x.platform === NextIDPlatform.LENS
            const profileUri = isLens ? x.links.lens.link : undefined
            return <SocialAccountListItem key={i} {...x} profileUrl={profileUri} onClose={() => closeMenu()} />
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
            anchorPosition,
            anchorReference,
            PaperProps: {
                className: classes.menuPaper,
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

    useEffect(() => {
        window.addEventListener('scroll', closeMenu)
        return () => window.removeEventListener('scroll', closeMenu)
    }, [closeMenu])

    const platformIcons = useMemo(() => {
        return uniqBy(web3bioProfiles, (x) => x.platform)
            .map((x) => resolveNextIDPlatformIcon(x.platform))
            .filter(isNonNull)
            .slice(0, 3)
    }, [web3bioProfiles])

    if (!platformIcons.length) return null

    return (
        <div {...rest}>
            <Button variant="text" onClick={openMenu} className={classes.iconStack} disableRipple>
                {platformIcons.map((Icon, index) => (
                    <Icon key={Icon.displayName || index} className={classes.icon} size={20} />
                ))}
            </Button>
            {menu}
        </div>
    )
})
