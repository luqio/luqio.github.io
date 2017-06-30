module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        version: Math.random().toString().slice(2, 5),
        
        copy: {
            dev: {
                expand: true,
                cwd: '../js/libs/YkJsBridgeSDK/',
                src: 'YkJsBridgeSDK.2.0.js',
                dest: 'src/js/utils/'
            }
        },
        requirejs: {
            plugins: {
                options: {
                    baseUrl: "src/js",
                    mainConfigFile: "src/js/main.js",
                    name: "main", // assumes a production build using almond
                    out: "o/js/main.js"
                }
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            plugins: {
                files: {
                    //  压缩成无前缀的css
                    "src/css/main.min.css": ["src/css/*/*.css"]
                }
            }
        },

        autoprefixer: {
            options: {
                "browsers": ["last 50 versions", "iOS 6", "Android 4.0"]
            },
            plugins: {
                files: {
                    // 动态添加前缀
                    "o/css/main.min.css": ["src/css/main.min.css"]
                }
            }
        },

        'string-replace': {
            css: {
                files: {
                    'src/css/': 'src/css/*.css'
                },
                options: {
                    replacements: [{
                        pattern: /\.\.\/\.\.\/img/ig,
                        replacement: 'http://static.youku.com/v<%= version %>/plugins/utilPanel/img'
                    }]
                }
            },
            js: {
                files: {
                    'o/js/': 'o/js/*.js'
                },
                options: {
                    replacements: [{
                        pattern: /debug\:\s?(\!0|true)/ig,
                        replacement: 'debug:!1'
                    }]
                }
            }
        },

        tmod: {
            template: {
                src: "./src/view/**/*.html",
                dest: "./src/js/template/template.js",
                options: {
                   base: "./src/view"
                }
            }
        },

        watch: {
            css: {
                files: ['src/css/*/*.css'],
                tasks: ['cssmin', 'autoprefixer'],
                options: {
                    spawn: false,
                },
            },
            js: {
                files: ['src/js/**/*'],
                tasks: ['requirejs'],
                options: {
                    spawn: false,
                },
            }
        }
    });
    
    // less to css
    // grunt.loadNpmTasks('grunt-contrib-less');
//    grunt.loadNpmTasks('grunt-contrib-copy');
    // css autoprefixer
    grunt.loadNpmTasks('grunt-autoprefixer');
    // requirejs
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    // css min
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    //
    grunt.loadNpmTasks('grunt-string-replace');
    //
    grunt.loadNpmTasks('grunt-tmod');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // watch
    grunt.loadNpmTasks('grunt-contrib-watch');
    // 初始化一些安装操作，加载依赖
    grunt.registerTask('install-dev', ['copy']);
    // 默认被执行的任务列表， 测试
    grunt.registerTask('default', [/*'less',*/ 'cssmin', 'autoprefixer', 'tmod', 'requirejs']);
    // 生成生产环境代码
    grunt.registerTask('product', [/*'less',*/ 'cssmin', 'string-replace:css', 'autoprefixer', 'tmod', 'requirejs', 'string-replace:js']);
};
