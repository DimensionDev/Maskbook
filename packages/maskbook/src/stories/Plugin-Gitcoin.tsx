import { storiesOf } from '@storybook/react'
import { figmaLink } from './utils'
import { action } from '@storybook/addon-actions'
import { PreviewCard } from '../plugins/Gitcoin/UI/PreviewCard'

storiesOf('Plugin: Gitcoin', module).add(
    'Preview Card',
    () => (
        <div style={{ padding: 16, background: 'white' }}>
            <style>
                {`img {
            background-image: linear-gradient(45deg, #CBCBCB 25%, transparent 25%, transparent 75%, #CBCBCB 75%, #CBCBCB), linear-gradient(45deg, #CBCBCB 25%, transparent 25%, transparent 75%, #CBCBCB 75%, #CBCBCB);
            background-size: 30px 30px;
            background-position: 0 0, 15px 15px;
        }`}
            </style>
            <PreviewCard id="479" onRequest={action('Request Grant')} />
        </div>
    ),
    figmaLink('https://www.figma.com/file/6YeqA0eCTz67I1HVFXOd4X/Plugin%3A-Gitcoin'),
)
