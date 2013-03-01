var spawn = require('child_process').spawn;

var restify = require('restify');

var serverOptions = {
    name: 'wkhtmltopfd-aas',
    version: '1.0.0'
};

var server = restify.createServer(serverOptions);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
// server.use(restify.bodyParser());

server.get('/', function(req, res, next) {
    if (req.params.url === undefined) {
        return next(new restify.MissingParameterError('url'));
    }
    var filename=req.params.filename || 'print.pdf';
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="'+filename+'"');

    var cmd = 'wkhtmltopdf';
    var args = ['-q', req.params.url, '-'];
    console.log(cmd, args.join(' '));
    var child = spawn(cmd, args);
    child.stdout.pipe(res, {end: false});
    child.on("error", function(e) {
        console.log("ERR", e);  
    });
    child.on('exit', function(code) {
        if (code !== 0) {
            console.log('non zero');
            return next(new restify.InternalError('wkhtmltopdf failed'));
        } else { 
            console.log('success!');
            return res.end();
        }
    });
});

server.listen(8000);
