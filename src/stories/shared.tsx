import React from 'react'
import { storiesOf } from '@storybook/react'
import { NotSetupYetPromptUI } from '../components/shared/NotSetupYetPrompt'
import { ChooseIdentity } from '../components/shared/ChooseIdentity'
import { boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

storiesOf('Shared Components', module)
    .add('NotSetupYetPrompt', () => (
        <NotSetupYetPromptUI
            preparingSetup={boolean('collectingIdentity', true)}
            disableSetupButton={boolean('disableSetupButton', true)}
            onSetupClick={action('onSetupClick')}
        />
    ))
    .add('ChooseIdentity', () => {
        return <ChooseIdentity />
    })
