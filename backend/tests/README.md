Sanity & Test notes

- `test:sanity` runs the simple module-require check to confirm edited backend modules load without syntax errors.

Run from the `backend` folder:

```powershell
npm run test:sanity
```

This is a lightweight check and does not connect to the database. For full integration or e2e tests, run the server and use a test database, then implement mocha/jest and seed fixtures.
