import React from 'react'
import { storiesOf } from '@storybook/react'
import { NotSetupYetPrompt } from '../components/shared/NotSetupYetPrompt'

storiesOf('Shared Components', module).add('NotSetUp', () => <NotSetupYetPrompt />)
