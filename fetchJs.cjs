const fs = require('fs');
const https = require('https');

https.get('https://asesoriasintegralesmjm.com/assets/index-BVkYdlgw.js', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            fs.writeFileSync('mjm.js', rawData);
            console.log('Downloaded');
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
