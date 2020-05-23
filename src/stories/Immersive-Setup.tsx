import React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { ECKeyIdentifier } from '../database/type'
import { Draggable } from '../components/InjectedComponents/ImmersiveGuide/Draggable'
import { SetupGuide } from '../components/InjectedComponents/ImmersiveGuide/SetupGuide'

storiesOf('Immersive Setup', module).add('Guide', () => (
    <Draggable>
        <SetupGuide
            persona={new ECKeyIdentifier('secp256k1', 'test_key')}
            provePost={text('Prove post', '🎭A81Kg7HVsITcftN/0IBp2q6+IyfZCYHntkVsMTRl741L0🎭')}
            onClose={action('close')}
        />
    </Draggable>
))
