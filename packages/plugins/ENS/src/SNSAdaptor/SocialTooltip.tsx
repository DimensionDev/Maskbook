import type { PropsWithChildren } from 'react'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'

interface StyleProps {
    isMenuScroll?: boolean
    hidden?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { hidden = false }) => {
    return {
        tooltip: {
            visibility: hidden ? 'hidden' : 'visible',
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})
interface SocialTooltipProps {
    platform?: NextIDPlatform
    hidden?: boolean
}
export function SocialTooltip({
    children,
    hidden = false,
    platform = NextIDPlatform.NextID,
}: PropsWithChildren<SocialTooltipProps>) {
    const { classes } = useStyles({ hidden })
    const t = useSharedI18N()
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
            arrow
            placement="top"
            title={
                <Typography style={{ padding: '6px 2px', whiteSpace: 'nowrap' }} fontSize={14}>
                    {t.account_icon_tooltips({ source: resolveNextIDPlatformName(platform) })}
                </Typography>
            }>
            <div>{children}</div>
        </ShadowRootTooltip>
    )
}
