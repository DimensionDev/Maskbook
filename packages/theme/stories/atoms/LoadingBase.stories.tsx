import { story } from '../utils'
import { LoadingBase as MaskLoadingBase } from '../../src/Components'

const { meta, of } = story(MaskLoadingBase)
export default meta({
    title: 'Atoms/LoadingBase',
})

export const LoadingBase: unknown = of({})
