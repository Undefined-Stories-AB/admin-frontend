# Admin Frontend

Simple React Frontend to Authenticate Fortnox Application using OAuth2.

NOTE: While developeing, run both `npm run dev` and `npm run build:watch` for livereload functionality, otherwise only running `npm run dev` gives stale web instances i.e. changed code doesn't reflect on hosted content from `./dist`.

## Usage

Build and deploy `./dist/` folder.
Or simply run `npm run dev` and access site at `http://localhost:8090`.

Login using Findus login details provided from admin.


Make sure that `findus-backend` is running and is accessible on `http://localhost:8080`

Environment Variables are stored in `./esbuild.ts`, as opposed to .env, feel free to change this.

For some reason, the `PORT` doesn't get assigned properly unless using explicitly setting it using `cross-env PORT=8090 `, see `package.json`.



 

## Troubleshooting

If you fail to Authenticate properly, make sure that you are logged in by manually removing any existing expired JWT token in Session Storage.