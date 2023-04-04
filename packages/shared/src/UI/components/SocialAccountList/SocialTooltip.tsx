import { useSharedI18N } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

interface StyleProps {
    isMenuScroll?: boolean
    hidden?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { hidden = false }) => {
    return {
        tooltip: {
            visibility: hidden ? 'hidden' : 'visible',
        },
    }
})
interface SocialTooltipProps {
    platform?: NextIDPlatform
    hidden?: boolean
    children: ReactElement
}
export function SocialTooltip({ children, hidden = false, platform = NextIDPlatform.NextID }: SocialTooltipProps) {
    const { classes } = useStyles({ hidden })
    const t = useSharedI18N()
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            arrow
            placement="top"
            title={
                <Typography style={{ padding: '6px 2px', whiteSpace: 'nowrap' }} fontSize={14}>
                    {t.account_icon_tooltips({ source: resolveNextIDPlatformName(platform) })}
                </Typography>
            }>
            {children}
        </ShadowRootTooltip>
    )
}
