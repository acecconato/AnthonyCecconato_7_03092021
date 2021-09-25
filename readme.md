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
- **app/config/database.json**

Create the .env file
> `cp .env.example .env`

Then create the database and tables from the schemas with: 
>`npx sequelize db:create && npx sequelize db:migrate`
>
> It will install it based on the database configuration.

#### Optionally you can generate demo users by doing: `npx sequelize db:seed:all`
>
>Demo accounts available:
>- demo0 - aStrongPassword@0
>- demo1 - aStrongPassword@0
>- ...
>- demo10 - aStrongPassword@0
>
>Admin account : admin - aStrongPassword@0

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

⚠️ If the page is blank and you got an error in the console about the user or the Local Storage, verify that you don't already have a "user" key inside your Local Storage for the localhost:8080. (Chrome: Open web inspector -> Application -> Local Storage) 
