## Description

Flow to play game:

- signup user
- signin user
- create game (/game/start POST) OR
- get list of games to join (/game/joinlist GET) AND join game (/game/:id/join PATCH)
- create move (/game/move/create POST)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
