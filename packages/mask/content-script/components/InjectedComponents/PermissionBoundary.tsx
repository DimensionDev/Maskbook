import { memo, type PropsWithChildren, type ReactNode, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { PluginWrapperComponentProps, Plugin, PluginWrapperMethods } from '@masknet/plugin-infra/content-script'
import { MaskPostExtraPluginWrapper } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Typography, useTheme } from '@mui/material'
import { useCheckPermissions, useGrantPermissions } from '../DataSource/usePluginHostPermission.js'
import { PossiblePluginSuggestionUISingle } from './DisabledPluginSuggestion.js'
import { Trans } from '@lingui/react/macro'

interface PermissionBoundaryProps extends PropsWithChildren {
    permissions: string[]
    fallback?:
        | ReactNode
        | ((grantState: AsyncState<boolean>, onGrantPermissions: () => Promise<boolean | undefined>) => ReactNode)
}

const PermissionBoundary = memo<PermissionBoundaryProps>(function PermissionBoundary({
    permissions,
    fallback,
    children,
}) {
    const { value: hasPermissions = true } = useCheckPermissions(permissions)

    const [grantState, onGrant] = useGrantPermissions(permissions)

    if (!hasPermissions && fallback && permissions.length)
        return <>{typeof fallback === 'function' ? fallback(grantState, onGrant) : fallback}</>

    return <>{children}</>
})

export function MaskPostExtraPluginWrapperWithPermission({
    ref,
    ...props
}: PluginWrapperComponentProps<Plugin.SiteAdaptor.Definition>) {
    const wrapperMethodsRef = useRef<PluginWrapperMethods | null>(null)
    const theme = useTheme()
    const [open, setOpen] = useState<boolean>(false)

    const refItem = useMemo((): PluginWrapperMethods => {
        return {
            setWidth: (width) => wrapperMethodsRef.current?.setWidth(width),
            setWrap: (open) => {
                setOpen(open)
                wrapperMethodsRef.current?.setWrap(open)
            },
            setWrapperName: (name) => wrapperMethodsRef.current?.setWrapperName(name),
        }
    }, [])

    useImperativeHandle(ref, () => refItem, [refItem])

    return (
        <PermissionBoundary
            permissions={props.definition.enableRequirement.host_permissions ?? EMPTY_LIST}
            fallback={
                open ?
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
                                <Trans>
                                    Mask Network requires you to authorize the following websites before using it.
                                </Trans>
                                <Typography component="div">
                                    {props.definition.enableRequirement.host_permissions?.join(',')}
                                </Typography>
                            </Typography>
                        }
                    />
                :   undefined
            }>
            <MaskPostExtraPluginWrapper
                {...props}
                ref={(methods) => {
                    if (methods) wrapperMethodsRef.current = methods
                }}
            />
        </PermissionBoundary>
    )
}
