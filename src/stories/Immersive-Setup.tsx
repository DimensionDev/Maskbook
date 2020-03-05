import React from 'react'
import { storiesOf } from '@storybook/react'
import {
    ImmersiveSetupStepper,
    ImmersiveSetupState,
} from '../components/InjectedComponents/ImmersiveSetup/SetupStepper'
import { text } from '@storybook/addon-knobs'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { action } from '@storybook/addon-actions'
import { ECKeyIdentifier } from '../database/type'
import { DraggableDiv } from '../components/InjectedComponents/ImmersiveSetup/DraggableDiv'

storiesOf('Immersive Setup', module).add('Stepper', () => (
    <DraggableDiv>
        <ImmersiveSetupStepper
            persona={new ECKeyIdentifier('secp256k1', 'test_key')}
            loadProfile={async () => {
                action('loadProfile')()
                await sleep(700)
            }}
            provePost={text('Prove post', '🎭A81Kg7HVsITcftN/0IBp2q6+IyfZCYHntkVsMTRl741L0🎭')}
            onClose={action('close')}
            autoPasteProvePost={async () => {
                action('autoPasteProvePost')()
                await sleep(700)
            }}
        />
    </DraggableDiv>
))
