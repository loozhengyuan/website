// Lighthouse CI configuration file.
// https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md

module.exports = {
    ci: {
        collect: {
            staticDistDir: './build/',
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
}
