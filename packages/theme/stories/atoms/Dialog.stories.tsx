import { DialogExample } from './DialogExample'
import { story, MuiArgs, matrix } from '../utils'

const { meta, of } = story(DialogExample)
export default meta({
    title: 'Atoms/Dialog',
    parameters: {},
})

export const Dialog = of({
    args: { withBack: true, withExit: true, withLeftAction: false },
})
