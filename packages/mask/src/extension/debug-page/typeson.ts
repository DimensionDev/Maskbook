import { Typeson } from 'typeson'

// @ts-ignore
import { builtin, blob, file, filelist, imagebitmap, specialNumbers } from 'typeson-registry'
import * as CustomTypes from './typeson-custom-types'

const typeson = new Typeson({})
typeson.register(builtin)
typeson.register(specialNumbers)
typeson.register([blob, file, filelist, imagebitmap])
typeson.register([CustomTypes])

export default typeson
