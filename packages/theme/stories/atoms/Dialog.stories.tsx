import { DialogExample } from './DialogExample.js'
import { story } from '../utils/index.js'

const { meta, of } = story(DialogExample)
export default meta({
    title: 'Atoms/Dialog',
    parameters: {},
})

export const Dialog = of({
    args: { withBack: true, withExit: true, withLeftAction: false },
})
