import type { PluginWrapperComponent, Plugin, PluginWrapperMethods } from '@masknet/plugin-infra/content-script'
import { MaskPostExtraPluginWrapper } from '@masknet/shared'
import { Typography, useTheme } from '@mui/material'
import { noop } from 'lodash-unified'
import { forwardRef, memo, PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useState } from 'react'
import { useCheckPermissions } from '../../components/DataSource/usePluginHostPermission.js'
import { PossiblePluginSuggestionUISingle } from '../../components/InjectedComponents/DisabledPluginSuggestion.js'
import { useI18N } from '../../utils'
export interface PermissionBoundaryProps extends PropsWithChildren<{}> {
    permissions: string[]
    fallback?: ReactElement | ((loading: boolean) => ReactElement)
}

export const PermissionBoundary = memo<PermissionBoundaryProps>(({ permissions, fallback, children }) => {
    const { value: hasPermissions, loading } = useCheckPermissions(permissions)

    if (!hasPermissions && fallback) return typeof fallback === 'function' ? fallback(loading) : fallback

    return <>{children}</>
})

export const MaskPostExtraPluginWrapperWithPermission: PluginWrapperComponent<Plugin.SNSAdaptor.Definition> =
    forwardRef((props, ref) => {
        const theme = useTheme()
        const { t } = useI18N()
        const [open, setOpen] = useState<boolean>(false)

        const refItem = useMemo((): PluginWrapperMethods => {
            return {
                setWidth: noop,
                setWrap: setOpen,
                setWrapperName: noop,
            }
        }, [])

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
                                    px="18px">
                                    {t('authorization_descriptions')}
                                    <Typography component="p">
                                        {props.definition.enableRequirement.host_permissions?.join(',')}
                                    </Typography>
                                </Typography>
                            }
                        />
                    ) : undefined
                }>
                <MaskPostExtraPluginWrapper {...props} ref={ref} />
            </PermissionBoundary>
        )
    })
