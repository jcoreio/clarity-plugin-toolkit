module.exports = {
  esmBabelEnv: { targets: { node: 24 } },
  scripts: {
    clean: "clarity-plugin-toolkit clean",
    build: "clarity-plugin-toolkit build",
    deploy: "clarity-plugin-toolkit deploy",
    dev: "clarity-plugin-toolkit dev",
  },
};
