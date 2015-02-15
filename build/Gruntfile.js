module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        bumpup: {
            options: {
                updateProps: {
                    pkg: 'package.json'
                }
            },
            file: 'package.json'
        },

        clean: {
            default: ["../dist/*"],
            options: {
                force: true
            }
        },

        uglify: {
            options: {
                banner: grunt.file.read('BANNER'),
                compress: {
                    drop_console: true
                },
                preserveComments: false
            },
            build: {
                files: {
                    '../dist/lib/tangiblekeyboard.js': ['../src/tangiblekeyboard.js'],
                    '../dist/lib/layouts/tangiblekeyboard.layout.ipacve.js': ['../src/layouts/tangiblekeyboard.layout.ipacve.js']
                }
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                version: '<%= pkg.version %>',
                description: '<%= pkg.description %>',
                url: '<%= pkg.url %>',
                //logo: '<%= pkg.logo %>',
                options: {
                    outdir: '../dist/docs',
                    linkNatives: true,
                    paths: ['../src']
                }
            }
        },

        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>'
                        },
                        {
                            match: 'author',
                            replacement: '<%= pkg.author %>'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['../dist/lib/tangiblekeyboard.js'],
                        dest: '../dist/lib/'
                    }
                ]
            }
        },

        compress: {
            main: {
                options: {
                    archive: '../packaged/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {src: ['**'], cwd: "../dist/", expand: true}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask("default", ['bumpup:prerelease', 'clean', 'uglify', 'yuidoc', 'replace', 'compress']);

};
