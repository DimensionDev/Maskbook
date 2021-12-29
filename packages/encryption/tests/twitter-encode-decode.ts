import { test, expect } from '@jest/globals'
import { TwitterDecoder } from '../src/social-network-encode-decode'
test('Can decode Twitter text payload', () => {
    const payload = `This tweet is encrypted with #mask_io (@realMaskNetwork). 📪🔑

    Install https://mask.io/?PostData_v1=%204/4.mFXgbxPDrAD6PYRHWJW5IVlHObuFYs/LUyd08kkUkKimTx4opjHXjrgorrsyTPidL0lkeqdXnW3EzEacdlPJChko-Q5Wy113UMHYy1aV1Wheqwy/vM3PLMVaoKW/HyIL/SjJtim75bWMSHmj+vzMYwV59jLJqlTjJqhz5ObdZhAsWwRJGYIzEkg+.SKlWOvMpyF9T1jL2pr95kA_=.ehROC4d3QudYHEABcBTpSuxLvxM=._.Aq/bVWAKvodJuURGk3enjE1gUiu2SELM8IIKIlNGqOWM.1.dHdpdHRlci5jb20vd2lsbHlvbnRvdXI=%40 to decrypt it.`
    expect(TwitterDecoder(payload)).toMatchSnapshot('Twitter example')
})
