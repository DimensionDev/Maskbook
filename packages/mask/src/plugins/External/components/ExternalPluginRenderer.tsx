import type { ExternalPluginLoadDetails } from '../types'
import { Card, CardHeader, Typography, Link, Button } from '@mui/material'
// import { PermissionAwareRedirectOf } from '../../../extension/popups'
import { useExternalPluginManifest, useExternalPluginTemplate } from '../loader'
import { useI18N } from '../../../utils'

export function ExternalPluginRenderer(props: ExternalPluginLoadDetails) {
    const { t } = useI18N()
    const manifest = useExternalPluginManifest(props.url)
    const template = useExternalPluginTemplate(props.url, manifest.value, props.metaKey)
    const retry = (
        <Button
            size="small"
            sx={{ float: 'right' }}
            onClick={() => {
                manifest.retry()
                template.retry()
            }}
            children="Retry"
        />
    )
    if (!manifest.value || !template.value) return retry
    return (
        <Card sx={{ border: '1px solid orange', marginTop: 2 }}>
            <CardHeader
                title={
                    <>
                        {t('plugin_external_name')}: {manifest.value.name}
                        {retry}
                    </>
                }
                subheader={
                    <>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {t('plugin_external_unverified_publisher', { publisher: manifest.value.publisher })}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {t('plugin_external_plugin_url')}
                            <Link href={props.url} target="_blank">
                                {props.url}
                            </Link>
                        </Typography>
                    </>
                }
            />
            {/* <CardContent>
                <RenderContext.Provider
                    value={{
                        permissionAwareOpen(url: string) {
                            const context = createThirdPartyPopupContext()
                            Services.ThirdPartyPlugin.openPluginPopup(PermissionAwareRedirectOf(url, context), [
                                context,
                                props.metaKey,
                                props.meta,
                            ])
                        },
                        baseURL: props.url,
                    }}>
                    <MaskExternalPluginPreviewRenderer
                        pluginBase={props.url}
                        onError={console.warn}
                        script=""
                        payload={props.meta}
                        template={template.value}
                    />
                </RenderContext.Provider>
            </CardContent> */}
        </Card>
    )
}
