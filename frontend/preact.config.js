export default (config, env, helpers) => {
    if (env.dev) {
        config.devServer.host = 'localhost';
    }
};
