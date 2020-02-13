import React from 'react'
import { storiesOf } from '@storybook/react'
import { Settings } from '../extension/options-page/Settings/settings'

storiesOf('Settings', module).add('Persona Create Dialog', () => (
    <div style={{ padding: '0 15px 20px', border: '1px dotted ghostwhite' }}>
        <Settings></Settings>
    </div>
))
