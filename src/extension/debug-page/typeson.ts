import Typeson from 'typeson'

// @ts-ignore
import builtins from 'typeson-registry/dist/presets/builtin' // @ts-ignore
import num from 'typeson-registry/dist/presets/special-numbers' // @ts-ignore
import blob from 'typeson-registry/dist/types/blob' // @ts-ignore
import file from 'typeson-registry/dist/types/file' // @ts-ignore
import fileList from 'typeson-registry/dist/types/filelist' // @ts-ignore
import imageBitMap from 'typeson-registry/dist/types/imagebitmap' // @ts-ignore
import * as CustomTypes from './typeson-custom-types'

const typeson = new Typeson({})
typeson.register(builtins)
typeson.register(num)
typeson.register([blob, file, fileList, imageBitMap, num])
typeson.register([CustomTypes])

export default typeson
