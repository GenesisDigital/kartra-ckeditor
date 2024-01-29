// webpack.config.js

const path = require( 'path' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
    entry: './src/ckeditor.js',
    output: {
		library: 'CKEDITOR',
        path: path.resolve( __dirname, 'dist' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
    },
	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
				extractComments: false,
                terserOptions: {
                  format: {
                    comments: false,
                  },
                },
			} )
		]
	},
    module: {
        rules: [
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: [ 'raw-loader' ]
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag',
                            attributes: {
                                'data-cke': true
                            }
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: styles.getPostCssConfig( {
                                themeImporter: {
                                    themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
                                },
                                minify: true
                            } )
                        }
                    }
                ]
            }
        ]
    }
};
