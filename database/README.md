# Database

Uses MongoDB

## Install

Server install instructions can be found [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/).

1. `xcode-select --install`
2. `brew tap mongodb/brew`
3. `brew update`
4. `brew install mongodb-community@6.0`


## MongoDB Commands

* Start service: `brew services start mongodb-community@6.0`
* Stop service: `brew services stop mongodb-community@6.0`
* Start shell: `mongosh`
    * View databases: `show dbs`
    * Create/enter database: `use <name>`
    * Implicitly write/create collection: `db.user.insert({name: "Ada Lovelace", age: 205})`
    * Explicitly create collection: `` <https://www.mongodb.com/docs/manual/reference/method/db.createCollection/>

## Create DB structure using mongosh

### Hospital

