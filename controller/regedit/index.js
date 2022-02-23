const regedit = require('regedit')

function updateRegistry() {
    regedit.createKey([
        'HKLM\\SOFTWARE\\Policies\\Chromium',
        'HKLM\\SOFTWARE\\Policies\\Google\\Chrome',
        'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge'
    ], (err) => {
        regedit.putValue({
            "HKLM\\SOFTWARE\\Policies\\Chromium": {
                'InsecurePrivateNetworkRequestsAllowed': {
                    value: 1,
                    type: 'REG_DWORD'
                }
            },
            "HKLM\\SOFTWARE\\Policies\\Google\\Chrome": {
                'InsecurePrivateNetworkRequestsAllowed': {
                    value: 1,
                    type: 'REG_DWORD'
                }
            },
            "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge": {
                'InsecurePrivateNetworkRequestsAllowed': {
                    value: 1,
                    type: 'REG_DWORD'
                }
            }
        }, err => {
            if (err == null)
                console.log('installation completed')
            else
                console.log(err)
        })
    })
}
module.exports = updateRegistry