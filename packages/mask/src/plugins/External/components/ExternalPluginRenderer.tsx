import type { ExternalPluginLoadDetails } from '../types'
import { Card, CardHeader, CardContent, Typography, Link, Button } from '@mui/material'
import Services from '../../../extension/service'
import { MaskExternalPluginPreviewRenderer, RenderContext } from '@masknet/external-plugin-previewer'
import { PermissionAwareRedirectOf } from '../../../extension/popups'
import { createThirdPartyPopupContext } from '../sns-context'
import { useExternalPluginManifest, useExternalPluginTemplate } from '../loader'

export function ExternalPluginRenderer(props: ExternalPluginLoadDetails) {
    const manifest = useExternalPluginManifest(props.url)
    const template = useExternalPluginTemplate(props.url, manifest.value, props.metaKey)
    const retry = (
        <Button
            variant="contained"
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
                        External plugin: {manifest.value.name}
                        {retry}
                    </>
                }
                subheader={
                    <>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            Publisher: {manifest.value.publisher} (Unverified)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            Plugin URL:{' '}
                            <Link href={props.url} target="_blank">
                                {props.url}
                            </Link>
                        </Typography>
                    </>
                }
            />
            <CardContent>
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
            </CardContent>
        </Card>
    )
}
