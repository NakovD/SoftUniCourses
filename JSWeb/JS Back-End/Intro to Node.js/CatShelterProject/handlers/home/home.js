const url = require('url');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/' && req.method === 'GET') {

        let filePath = path.normalize(
            path.join(__dirname, '../../views/home/index.html'));
            
            fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write('error occured');
                res.end();
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(data);
            res.end();
            return;
        });
    } else {
        return true;
    }
}