// import other routes
const mainRoutes = require('./main');
const fs = require('fs');

const appRouter = (app, fs) => {
	app.set('view engine', 'html');
	
    // default route
    app.get('/', (req, res) => {
    	const html = fs.readFileSync('./data/endpoints.html', 'utf8')
        res.send(html);
    });

    // all other routes
    mainRoutes(app, fs);

};

module.exports = appRouter;