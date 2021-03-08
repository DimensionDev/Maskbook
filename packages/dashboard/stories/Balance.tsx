import { story } from '@dimensiondev/maskbook-storybook-shared'
import { Balance as C } from '../src/components/Balance'
const { meta, of } = story(C)

export default meta({ title: '/Components/Balance' })

export const Balance = of({ args: { balance: 9000000 } })
