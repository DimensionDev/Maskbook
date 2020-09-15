// in .storybook/manager.js
import addons from '@storybook/addons'
import { create } from '@storybook/theming'

addons.setConfig({
    theme: create({
        base: 'dark',
        brandTitle: 'Maskbook',
        brandUrl: 'https://maskbook.com/',
        brandImage: 'https://maskbook.com/img/maskbook--logotype-white.png',
    }),
})
