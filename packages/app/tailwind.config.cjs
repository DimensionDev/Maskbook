const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    variants: {},
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/aspect-ratio'),
    ],
    content: [
        './src/**/*.js',
        './src/**/*.jsx',
        '../shared/src/Modals/modals/**/*.js',
        '../shared/src/Modals/modals/**/*.jsx',
        '../shared/src/Modals/modals/**/*.ts',
        '../sahred/src/Modals/modals/**/*.tsx',
    ],
}
