const fs = require('fs');
const https = require('https');
const http = require('http');
const domainIP = "123.20.222.42";

module.exports = {
    startServer: function(app, port) {
        const sslServer = https.createServer({
            key: fs.readFileSync('./cert/key.pem'),
            cert: fs.readFileSync('./cert/cert.pem')
        }, app);
          
        sslServer.listen(port, ()=>
            console.log(`Example app listening on https://${domainIP}`)
        );
    },
    startLocal: function(app, port) {
        app.listen(port, () => {
            console.log(`Example app listening on localhost:${port}`)
        })
    }
}
