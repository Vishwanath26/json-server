
const mainRoutes = (app, fs) => {

    const dataPath = './data/dataStore.json';

    // helper methods
    const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };

    const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                throw err;
            }

            callback();
        });
    };

    const findIndex = (data, type, id) => {
        let ind = -1;
         for(let i=0;i<data[type].length;i++) {
                if(data[type][i]['id']==id) {
                    ind = i;
                    break;
                }
            }
        return ind;
    }

    // READ(with or without filters)
    app.get('/:type', (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            const type = req.params['type']
            const requestQuery = req.query
            let item = JSON.parse(data)[type]

            //for sorting
            if(requestQuery['_sort']) {
            if(requestQuery['_order']==='desc')
                    item.sort((a, b) => b[requestQuery['_sort']] - a[requestQuery['_sort']])
                
            else
                    item.sort((a, b) => a[requestQuery['_sort']] - b[requestQuery['_sort']])
            }
            //for filters
            for(filterKey in requestQuery) {
                    if(filterKey === 'q')
                        item = item.filter(item => Object.values(item).includes(requestQuery['q']))
                    else if(filterKey !== '_sort' && filterKey !== '_order')
                        item = item.filter(item => item[filterKey] === requestQuery[filterKey])
                }

            res.send(item);
        });
    });

    //READ BY ID
    app.get('/:type/:id', (req, res) => {
        readFile(data => {

            const type = req.params['type']
            const id = req.params['id']
            let ind = findIndex(data, type, id)
            
            if(ind == -1)
               return res.status(400).send("id doesn't exist");
            res.send(data[type][ind])
        }, true);
    });

    // CREATE
    app.post('/:type', (req, res) => {

        readFile(data => {

            if(req.body['id']==null)
            {
                res.status(400).send('primary key id not found')
            }

            const newId = req.body['id'];
            const type = req.params['type'];

            if(data[type]==null) {
                let newType = [];
                newType.push(req.body)
                data[type] = newType;
            }

            else
                data[type].push(req.body);

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('success');
            });
        },true);
    });


    // UPDATE
    app.put('/:type/:id', (req, res) => {

        readFile(data => {

            const id = req.params["id"];
            const type = req.params['type'];
            let ind = findIndex(data, type, id)

            if(ind == -1)
               return res.status(400).send("id doesn't exist");

            if(req.body['id'] != id)
                return res.status(400).send("id is immutable");


            data[type][ind] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`${type} id:${id} updated`);
            });
        },
            true);
    });

    app.patch('/:type/:id', (req, res) => {

        readFile(data => {

            const type = req.params['type'];
            const id = req.params['id'];
            let ind = findIndex(data, type, id)
            if(ind == -1)
                return res.status(400).send("id doesn't exist");
            let item = data[type][ind];
            let updates = req.body;

            for(key in updates) {
                item[key] = updates[key]
            }

            data[type][ind] = item
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`${type} id:${id} updated`);
            });
        },true);
    })

    // DELETE
    app.delete('/:type/:id', (req, res) => {

        readFile(data => {
            const type = req.params['type']
            const id = req.params['id'];

            data[type] = data[type].filter(item => item['id'] != id);

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`${type} id:${id} removed`);
            });

        },true);
    });
};

module.exports = mainRoutes;
