import type { SvgIconClassKey } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'

const useStyles = makeStyles()({
    root: { verticalAlign: 'middle' },
})

export interface PostDialogIconProps extends withClasses<SvgIconClassKey> {
    onClick: () => void
}

export function PostDialogIcon(props: PostDialogIconProps) {
    const classes = useStylesExtends(useStyles(), props)
    return <MaskbookSharpIcon classes={classes} onClick={props.onClick} color="primary" />
}
