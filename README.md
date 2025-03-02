# PharmaTech Core API

## Project setup

```bash
$ npm install

# Prepare Husky
$ npm run prepare
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run the project with Docker
```bash
$ docker compose up --build
```

## Run migrations
To generate migrations we need to create folder called migrations if does not exists in the module folder.
After the entity definition or update it is necessary to generate the migration with the following command:
```bash
$ npm run migration:generate <path-to-migrations-folder>/<name>-migration
```

To generate the migration inside the docker container:
```bash
$ docker compose exec api npm run migration:generate <path-to-migrations-folder>/<name>-migration
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:coverage
```
