import type { PluginWrapperComponent, Plugin, PluginWrapperMethods } from '@masknet/plugin-infra/content-script'
import { MaskPostExtraPluginWrapper, useSharedI18N } from '@masknet/shared'
import { Typography, useTheme } from '@mui/material'
import { forwardRef, memo, PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useState } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { useCheckPermissions, useGrantPermissions } from '../DataSource/usePluginHostPermission.js'
import { PossiblePluginSuggestionUISingle } from './DisabledPluginSuggestion.js'
interface PermissionBoundaryProps extends PropsWithChildren<{}> {
    permissions: string[]
    fallback?:
        | ReactElement
        | ((grantState: AsyncState<boolean>, onGrantPermissions: () => Promise<boolean | undefined>) => ReactElement)
}

const PermissionBoundary = memo<PermissionBoundaryProps>(({ permissions, fallback, children }) => {
    const { value: hasPermissions = true } = useCheckPermissions(permissions)

    const [grantState, onGrant] = useGrantPermissions(permissions)

    if (!hasPermissions && fallback && permissions.length)
        return typeof fallback === 'function' ? fallback(grantState, onGrant) : fallback

    return <>{children}</>
})

export const MaskPostExtraPluginWrapperWithPermission: PluginWrapperComponent<Plugin.SNSAdaptor.Definition> =
    forwardRef((props, ref) => {
        const [postWrapperRef, setRef] = useState<PluginWrapperMethods | null>(null)
        const theme = useTheme()
        const t = useSharedI18N()
        const [open, setOpen] = useState<boolean>(false)

        const refItem = useMemo((): PluginWrapperMethods => {
            return {
                setWidth: (width) => postWrapperRef?.setWidth(width),
                setWrap: (open) => {
                    setOpen(open)
                    postWrapperRef?.setWrap(open)
                },
                setWrapperName: (name) => postWrapperRef?.setWrapperName(name),
            }
        }, [postWrapperRef])

        useImperativeHandle(ref, () => refItem, [refItem])
        return (
            <PermissionBoundary
                permissions={props.definition.enableRequirement.host_permissions ?? []}
                fallback={
                    open ? (
                        <PossiblePluginSuggestionUISingle
                            lackHostPermission
                            define={props.definition}
                            wrapperProps={props.definition.wrapperProps}
                            content={
                                <Typography
                                    color={theme.palette.maskColor.publicMain}
                                    fontSize={14}
                                    marginBottom={3.25}
                                    textAlign="left"
                                    component="div"
                                    px="18px">
                                    {t.authorization_descriptions()}
                                    <Typography component="div">
                                        {props.definition.enableRequirement.host_permissions?.join(',')}
                                    </Typography>
                                </Typography>
                            }
                        />
                    ) : undefined
                }>
                <MaskPostExtraPluginWrapper
                    {...props}
                    ref={(methods) => {
                        if (methods) setRef(methods)
                    }}
                />
            </PermissionBoundary>
        )
    })
