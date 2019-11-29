import React from 'react'
import { storiesOf } from '@storybook/react'
import { ChooseIdentity } from '../components/shared/ChooseIdentity'
import { boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

storiesOf('Shared Components', module).add('ChooseIdentity', () => {
    return <ChooseIdentity />
})
