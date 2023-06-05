import { isNonNull } from '@masknet/kit'
import { useMenuConfig } from '@masknet/shared'
import { NextIDPlatform, type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, type MenuProps } from '@mui/material'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useRef, type HTMLProps, memo } from 'react'
import { SocialAccountListItem } from './SocialListItem.js'
import { resolveNextIDPlatformIcon } from './utils.js'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { useFireflyLensAccounts } from '@masknet/web3-hooks-base'

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

interface SocialAccountListProps
    extends HTMLProps<HTMLDivElement>,
        Pick<MenuProps, 'disablePortal' | 'anchorPosition' | 'anchorReference'> {
    nextIdBindings: BindingProof[]
    userId?: string
}

const FireflyLensToNextIdLens = (account: FireflyBaseAPI.LensAccount): BindingProof => {
    return {
        platform: NextIDPlatform.LENS,
        name: account.name,
        identity: account.handle,
        created_at: '',
        is_valid: true,
        last_checked_at: '',
    }
}

export const SocialAccountList = memo(function SocialAccountList({
    nextIdBindings,
    disablePortal,
    anchorPosition,
    anchorReference,
    userId,
    ...rest
}: SocialAccountListProps) {
    const { classes } = useStyles()
    const ref = useRef<HTMLDivElement | null>(null)

    const { data: lensAccounts = EMPTY_LIST } = useFireflyLensAccounts(userId)
    // Merge and sort
    const orderedBindings = useMemo(() => {
        const merged = uniqBy(
            [...lensAccounts.map(FireflyLensToNextIdLens), ...nextIdBindings],
            (x) => `${x.platform}.${x.identity}`,
        )
        return merged.sort((a, z) => {
            if (a.platform === z.platform) return 0
            return a.platform === NextIDPlatform.LENS ? -1 : 0
        })
    }, [lensAccounts, nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        orderedBindings.map((x, i) => {
            const isLens = x.platform === NextIDPlatform.LENS
            const profileUri = isLens ? lensAccounts.find((y) => y.handle === x.identity)?.profileUri : undefined
            return <SocialAccountListItem key={i} {...x} profileUrl={profileUri?.[0]} onClose={() => closeMenu()} />
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

    useEffect(() => {
        window.addEventListener('scroll', closeMenu)
        return () => window.removeEventListener('scroll', closeMenu)
    }, [closeMenu])

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
                    <Icon key={Icon.displayName || index} className={classes.icon} size={20} />
                ))}
            </Button>
            {menu}
        </div>
    )
})
