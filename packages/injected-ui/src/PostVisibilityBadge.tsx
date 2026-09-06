import type { ReactNode } from 'react'
import { Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles<{ clickable: boolean }>()((theme, { clickable }) => ({
    visibilityBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(0.5, 1),
        background: theme.vars.palette.maskColor.bg,
        borderRadius: '999px',
        cursor: clickable ? 'pointer' : 'default',
    },
    iconAdd: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        background: theme.vars.palette.maskColor.primary,
        borderRadius: '50%',
        height: 16,
        width: 16,
    },
}))

export interface PostVisibilityBadgeProps {
    /** 'onlyYou' shows the clickable "+" affordance to open the recipient picker; 'everyone' is static. */
    variant: 'onlyYou' | 'everyone'
    label: ReactNode
    onClick?: () => void
}

/**
 * The small pill shown on a decrypted post indicating who else it's visible to, when the poster
 * hasn't shared it with any specific recipients yet. See
 * packages/mask/content-script/components/InjectedComponents/DecryptedPost/DecryptedPostSuccess.tsx,
 * which swaps this out for RecipientsToolTip once recipients are selected.
 */
export function PostVisibilityBadge(props: PostVisibilityBadgeProps) {
    const { variant, label, onClick } = props
    const { classes } = useStyles({ clickable: variant === 'onlyYou' })
    const theme = useTheme()
    return (
        <section className={classes.visibilityBox} onClick={variant === 'onlyYou' ? onClick : undefined}>
            <Typography color="textPrimary" sx={{ fontSize: 12, fontWeight: 500 }}>
                {label}
            </Typography>
            {variant === 'onlyYou' ?
                <div className={classes.iconAdd}>
                    <Icons.Plus size={12} color={theme.vars.palette.maskColor.white} />
                </div>
            :   null}
        </section>
    )
}
