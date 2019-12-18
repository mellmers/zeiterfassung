export default (config, env, helpers) => {
    if (env.dev) {
        config.devServer.host = 'localhost';

        config.devServer.proxy = [
            {
                // proxy requests matching a pattern:
                path: '/api/**',

                // where to proxy to:
                target: 'http://127.0.0.1:8081/api',

                // optionally change Origin: and Host: headers to match target:
                changeOrigin: true,
                changeHost: true,

                // optionally mutate request before proxying:
                pathRewrite: function(path, request) {
                    // you can modify the outbound proxy request here:
                    delete request.headers.referer;

                    // common: remove first path segment: (/api/**)
                    return '/' + path.replace(/^\/[^\/]+\//, '');
                },

                // optionally mutate proxy response:
                onProxyRes: function (proxyRes, req, res) {
                    // you can modify the response here:
                    proxyRes.headers.connection = 'keep-alive';
                    proxyRes.headers['cache-control'] = 'no-cache';
                }
            }
        ];
    }
};
