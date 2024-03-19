const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL||'postgres://localhost/the_acme_store_db')
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const createTables = async ()=>{
    const SQL = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS product CASCADE;
    DROP TABLE IF EXISTS favorite;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR (20) UNIQUE NOT NULL,
        password VARCHAR (255) UNIQUE NOT NULL
    );
    CREATE TABLE product(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR (255) NOT NULL
    );
    CREATE TABLE favorite(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES product(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_id_product_id UNIQUE (product_id, user_id)
    );
    `
    await client.query(SQL)
}

const createUser = async(username, password)=>{
    const SQL = `
    INSERT INTO users(id, username, password)
    VALUES($1, $2, $3)
    RETURNING *
    `
    const response = await client.query(SQL,[uuid.v4(), username, await bcrypt.hash(password, 5)])
    console.log(response.rows[0])
}

const createProduct = async(name)=>{
    const SQL = `
    INSERT INTO product(id, name)
    VALUES($1, $2)
    RETURNING *
    `
    const response = await client.query(SQL, [uuid.v4(), name])
    return response.rows[0]
}

const fetchUsers = async()=>{
    const SQL = `
    SELECT *
    FROM users
    `;
    const response = await client.query(SQL)
    return response.rows
}

const fetchProduct = async()=>{
    const SQL = `
    SELECT *
    FROM product
    `;
    const response = await client.query(SQL)
    return response.rows
}

const createFavorites = async({product_id, user_id})=>{
    const SQL = `
    INSERT INTO favorite(id, product_id, user_id)
    VALUES($1, $2, $3)
    RETURNING *
    `
    const response = await client.query(SQL, [uuid.v4(), product_id, user_id])
    return response.rows[0]
}

const fetchFavorites = async(user_id)=>{
    const SQL = `
    SELECT *
    FROM favorite 
    WHERE user_id = $1
    `
    const response = await client.query(SQL, [user_id])
    return response.rows
}

const destroyFavorite = async({user_id, id})=>{
    const SQL = `
    DELETE FROM favorite
    WHERE user_id = $1 AND id=$2
    `
    const response = await client.query(SQL, [id])
}



module.exports = {client, createTables, createUser, createProduct, fetchUsers, fetchProduct, createFavorites, fetchFavorites, destroyFavorite}