/** @type {import("snowpack").SnowpackUserConfig} */
module.exports = {
    mount: {
        public: { url: '/', static: true },
        src: { url: '/dist' },
    },
    plugins: ['@snowpack/plugin-react-refresh', '@snowpack/plugin-dotenv'],
    devOptions: {
        port: 23567,
    },
    buildOptions: {
        baseUrl: '/snowpack/dashboard/',
    },
}
