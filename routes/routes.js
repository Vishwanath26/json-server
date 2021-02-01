// import other routes
const mainRoutes = require('./main');

const appRouter = (app, fs) => {

    // default route
    app.get('/', (req, res) => {
        res.send('welcome to the json-server');
    });

    // all other routes
    mainRoutes(app, fs);

};

module.exports = appRouter;