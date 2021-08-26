module.exports = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'Bluestone',
        description: 'This is document for Bluestone API',
        termsOfService: '',
        contact: {
            name: 'Weiwei Wu',
            email: 'weiwei.wu@aspentech.com',
            url: 'https://github.com/3wweiweiwu/bluestone'
        }
    },
    paths: {
        '/record':
        {
            post: {
                summary: 'start recording and launch a new browser',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
            delete: {
                summary: 'stop recording and kill existing browser',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            }
        },
        '/steps':
        {
            post: {
                summary: 'Add new steps via front-end UI',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
            get: {
                summary: 'get current steps',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
            delete: {
                summary: 'delete steps specified',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            }
        },
        '/run': {
            post: {
                summary: 'run step specified',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
            get: {
                summary: 'get last run result',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
        },
        '/script': {
            get: {
                summary: 'get scripts',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
        },
        '/command': {
            get: {
                summary: 'get available function in current screen',
                responses: {
                    200: {
                        content: {
                            'application/json': {}
                        }
                    }
                }
            },
        }
    },
    definitions: {
        BatchInfo: {
            required: ['RowId'],
            'properties': {
                'RowId': {
                    'type': 'string',
                }
            }
        }
    }
};