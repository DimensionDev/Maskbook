import React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { ECKeyIdentifier } from '../database/type'
import { SetupGuide } from '../components/InjectedComponents/SetupGuide'

storiesOf('Setup Guide', module).add('Setup Guide', () => (
    <SetupGuide persona={new ECKeyIdentifier('secp256k1', 'test_key')} onClose={action('close')} />
))
