module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite3'
    },
    useNullAsDefault: true,
    pool: {
      min: 0,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite3'
    },
    useNullAsDefault: true,
    pool: {
      min: 0,
      max: 10
    },
  }
};

/* autogen by command:
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    },
    useNullAsDefault: true
  }
};
*/