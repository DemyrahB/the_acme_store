const express = require('express')
const app = express()
app.use(require('morgan')('dev'))
app.use(express.json())
const port = 8000
const {client, createTables, createUser, createProduct, fetchUsers, fetchProduct, createFavorites, fetchFavorites, destroyFavorite} = require('./db')

const init = async ()=>{
    await client.connect()
    await createTables()
    const [Abby, Brian, Carla, Produce, Meat, Dairy] = await Promise.all([
        createUser('Abby', 'password'),
        createUser('Brian', 'password1'),
        createUser('Carla', 'password2'),
        createProduct('Produce'),
        createProduct('Meat'),
        createProduct('Dairy')
    ]);
    console.log(await fetchUsers());
    console.log(await fetchProduct());
    await Promise.all([
        createFavorites({ user_id: Abby.id, product_id: Produce.id }),
    ])
    const favorite = await fetchFavorites()
    await destroyFavorite(reservation[0].id)
    console.log(await fetchFavorites())
    app.listen(port, ()=>{
        console.log('You are connected the database at port ' + port )
    })
}

app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers())
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        res.send(await fetchProduct())
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites())
    } catch (ex) {
        next(ex)
    }
})

app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
        await destroyFavorite({user_id: req.params.user_id, id: req.params.id})
        res,sendStatus(204)
    } catch (ex) {
        next(ex)
    }
})

app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
        res.send(201).send(await createFavorites({user_id: req.params.user_id, product_id:req.body.product_id}))
    } catch (ex) {
        next(ex)
    }
})


init()