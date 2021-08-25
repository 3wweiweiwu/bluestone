let request = require('supertest');
let app = require('../../app')
exports.startRecord = function (product, filePath) {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`/api/record`)
            .end((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
    });
};

exports.endRecord = function (product, filePath) {
    return new Promise((resolve, reject) => {
        request(app)
            .delete(`/api/record`)
            .end((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
    });
};