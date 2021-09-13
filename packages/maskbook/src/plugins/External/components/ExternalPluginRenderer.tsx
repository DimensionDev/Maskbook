import type { ExternalPluginLoadDetails } from '../types'
import { Card, CardHeader, CardContent, Typography, Link, Button } from '@material-ui/core'
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
            onClick={() => {
                manifest.retry()
                template.retry()
            }}
            children="Retry"
        />
    )
    if (!manifest.value || !template.value) return retry
    return (
        <Card sx={{ border: '1px solid red' }}>
            <CardHeader
                title={`Mask plugin (3rd party): ${manifest.value.name}`}
                subheader={
                    <>
                        <Typography variant="caption">
                            Publisher: {manifest.value.publisher} (⚠ Unverified)
                            <br />
                            Plugin URL: <Link href={props.url}>{props.url}</Link>
                            {retry}
                        </Typography>
                    </>
                }
            />
            <CardContent style={{ background: 'red', height: 200 }}>
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
