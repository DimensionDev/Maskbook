import { story } from '@dimensiondev/maskbook-storybook-shared'

const { meta, of } = story(Test)
function Test() {
    return <h1>hi</h1>
}

export default meta({ title: 'Test' })
export const test = of({})
