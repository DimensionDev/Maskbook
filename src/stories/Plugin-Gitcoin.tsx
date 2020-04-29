import React from 'react'
import { storiesOf } from '@storybook/react'
import { PreviewCard } from '../plugins/Gitcoin/PreviewCard'
import { text } from '@storybook/addon-knobs'
import { DonateCard } from '../plugins/Gitcoin/DonateCard'
import { figmaLink } from './utils'
import { action } from '@storybook/addon-actions'

storiesOf('Plugin: Gitcoin', module)
    .add(
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
                <PreviewCard
                    image={<img width="100%" height="100%" />}
                    title={text('Title', `This is a really long long long long long title`)}
                    line1={text('Line 1', `12,345 DAI`)}
                    line2={text('Line 2', `ESTIMATED`)}
                    line3={text('Line 3', `2,345 DAI`)}
                    line4={text('Line 4', `233 contributors`)}></PreviewCard>
            </div>
        ),
        figmaLink('https://www.figma.com/file/6YeqA0eCTz67I1HVFXOd4X/Plugin%3A-Gitcoin'),
    )
    .add(
        'Donate Card',
        () => (
            <div style={{ padding: 16, background: 'white' }}>
                <DonateCard
                    title={text('Title', 'Mask + Test Kit Mutual Aid Fund')}
                    description={text('Description', 'It is accepting contributions in any token.')}
                    onDonate={action('onDonate')}></DonateCard>
            </div>
        ),
        figmaLink('https://www.figma.com/file/6YeqA0eCTz67I1HVFXOd4X/Plugin%3A-Gitcoin'),
    )
