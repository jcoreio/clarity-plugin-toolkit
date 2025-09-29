/* eslint-env node, es2018 */
module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  // esmBabelEnv: { targets: { node: 16 } },
  scripts: {
    clean: "clarity-plugin-toolkit clean",
    build: "clarity-plugin-toolkit build",
    deploy: "clarity-plugin-toolkit deploy",
  },
};
