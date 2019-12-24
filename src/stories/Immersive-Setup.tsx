import React from 'react'
import { storiesOf } from '@storybook/react'
import { ImmersiveSetupStepper } from '../components/InjectedComponents/ImmersiveSetup/Setup-Stepper'
import { text } from '@storybook/addon-knobs'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { action } from '@storybook/addon-actions'

storiesOf('Immersive Setup', module).add('Stepper', () => (
    <ImmersiveSetupStepper
        loadProfile={async () => {
            action('onGoToProfileClicked')()
            await sleep(1200)
        }}
        provePost={text('Prove post', '🎭A81Kg7HVsITcftN/0IBp2q6+IyfZCYHntkVsMTRl741L0🎭')}
        onClose={action('close')}
    />
))
