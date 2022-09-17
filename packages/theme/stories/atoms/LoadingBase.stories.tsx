import { story } from '../utils/index.js'
import { LoadingBase as MaskLoadingBase } from '../../src/Components/index.js'

const { meta, of } = story(MaskLoadingBase)
export default meta({
    title: 'Atoms/LoadingBase',
})

export const LoadingBase: unknown = of({})
