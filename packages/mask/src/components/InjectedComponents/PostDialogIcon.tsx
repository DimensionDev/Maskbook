import type { SvgIconClassKey } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { MaskSharpIcon } from '@masknet/shared'

const useStyles = makeStyles()({
    root: { verticalAlign: 'middle' },
})

export interface PostDialogIconProps extends withClasses<SvgIconClassKey> {
    onClick: () => void
}

export function PostDialogIcon(props: PostDialogIconProps) {
    const { classes } = useStylesExtends(useStyles(), props)
    return <MaskSharpIcon classes={{ root: classes.root }} onClick={props.onClick} color="primary" />
}
