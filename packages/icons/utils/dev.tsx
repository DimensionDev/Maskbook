import { render as mount } from 'react-dom'
import { IconPreviewProps, IconPreview } from './previewer'

async function render(id: string, Icons: Promise<IconPreviewProps['icons']>, name: string) {
    mount(<IconPreview icons={await Icons} title={name} />, document.querySelector(id))
}
render('#brands', import('../brands'), 'brand icons (./brands)')
render('#general', import('../general'), 'general icons (./general)')
render('#plugins', import('../plugins'), 'general icons (./plugins)')
