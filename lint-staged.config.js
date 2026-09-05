export default {
    '*': 'prettier --write --ignore-unknown',
    'packages/**/*.{ts,tsx,js,jsx}': 'eslint --fix',
    'packages/**/*.svg': 'pnpm svgo',
}
