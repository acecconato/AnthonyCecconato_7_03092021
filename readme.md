# Groupomania

## Get started

### Server side (REST Api)
Clone the repository

> `git clone git@github.com:acecconato/AnthonyCecconato_7_03092021.git`
> 
> `cd AnthonyCecconato_7_03092021`

Install the dependencies

> `npm install --include=dev`

Configure the database: 
- **app/config/config.json**

Create the .env file
> `cp .env.example .env`

Then create the database and tables from the schemas with: 
>`npx sequelize db:create && npx sequelize db:migrate`

It will install it based on the database configuration.

Then run the server
> `npm run serve`

### Client side (Vue 3 application)

Open a new terminal in the same directory, then go to the client folder
> `cd client/`

Install the dependencies
> `npm install`

Run the client 
> `npm run serve`

The client is available on http://localhost:8080 (default configuration)
