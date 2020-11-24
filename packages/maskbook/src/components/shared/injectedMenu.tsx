import { createStyles, MenuClassKey, MenuProps, makeStyles } from '@material-ui/core'
import ShadowRootMenu from '../../utils/shadow-root/ShadowRootMenu'
import { getCustomUIOverwrite, useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme) => createStyles({}))

export type InjectedMenuClassKey = MenuClassKey

export interface InjectedMenuProps extends withClasses<InjectedMenuClassKey>, React.PropsWithChildren<{}> {
    open: boolean
    anchorEl: HTMLElement | null
    onClose?(): void
    children?: React.ReactNode
    MenuProps?: Partial<MenuProps>
}
export function InjectedMenu(props: InjectedMenuProps) {
    const classes = useStyles()
    const overwrite = getCustomUIOverwrite()
    props = overwrite.InjectedMenu?.props?.(props) ?? props
    const { ...menuClasses } = useStylesExtends(classes, props, overwrite.InjectedMenu?.classes)

    return (
        <ShadowRootMenu
            classes={menuClasses}
            open={props.open}
            anchorEl={props.anchorEl}
            onClose={props.onClose}
            {...props.MenuProps}>
            {props.children}
        </ShadowRootMenu>
    )
}
