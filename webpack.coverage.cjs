const path = require('node:path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                include: path.resolve(__dirname, 'src'),
                exclude: [/\.spec\.ts$/, /node_modules/],
                enforce: 'post',
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        plugins: [
                            [
                                'istanbul',
                                {
                                    exclude: ['**/*.spec.ts', '**/node_modules/**']
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    }
};