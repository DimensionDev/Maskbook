import type { PropsWithChildren } from 'react'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { resolveNextIDPlatformName } from '@masknet/web3-shared-base'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isMenuScroll = false }) => {
    return {
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
    }
})
export function SocialTooltip({
    children,
    platform = NextIDPlatform.NextID,
}: PropsWithChildren<{ platform?: NextIDPlatform }>) {
    const { classes } = useStyles({})
    const t = useSharedI18N()
    console.log({ platform })
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
            <div>{children}</div>
        </ShadowRootTooltip>
    )
}
