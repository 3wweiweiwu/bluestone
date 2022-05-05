const sql = require('mssql')

async function queryFromSql(user, password, database, server, query, encrypt = false) {
    let sqlConfig = {
        user: user,
        password: password,
        database: database,
        server: server,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: encrypt, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }

    try {
        let pool = await sql.connect(sqlConfig)
        const result = await sql.query(query)
        await pool.close()
        return result
    } catch (err) {
        // ... error checks
        sqlConfig['Query'] = query
        sqlConfig['Error'] = err.toString()
        let sqlConfigStr = JSON.stringify(sqlConfig)
        throw new Error(`Unable to query. ${sqlConfigStr}`)
    }
}
module.exports = queryFromSql