# CodingServe

Backend of CodingLand

**Currently in the alpha development stage(inner test), a lot of features are not implemented, very unstable, not recommend to deploy to product environment and public test!**

**We are looking for the translator!**

**Recommend use `pnpm` to manage package, use disk space efficient!**

## Start up

### Product

1. Pulling our docker image

```bash
docker pull xsheep2010/codingland:latest
```

2. Run the docker image

```bash
docker run --name lumbashark -p 3100:3100 -e DATABASE_URL="mysql://root:root@192.168.50.215:3306/lumbashark?schema=public" -d lumbashark:latest
```

3. Init scheme for the database(Upgrade with out this step)

```bash
docker exec -it <Your container id> /bin/sh
yarn prisma db push
```

4. All are done!

### Development

```bash
pnpm i
# ...editing .env file
pnpm prisma db push
pnpm start:dev
```

### Build

```bash
# ...install docker engine
# ...building codingui
pnpm i
pnpm build:docker # for docker
pnpm prisma generate && pnpm build # or for upload
```

## Project Structure

- `.vscode` settings for vscode
- `prisma` prisma configure file
- `public` serving root
- `src/controllers` controllers
- `src/decorators` permission guards helper
- `src/guards` controlellr guards
- `src/enums` script type documents
- `src/interceptors` before request handle in controller
- `src/modules` nestjs configure files
- `src/services` logic function
- `src/utils` useful function
- `templates` built-in templates
- `test` test of code

## Technology Stack

NestJS(MVC restful framework) + ExpressJS(Web core) + Prisma(Database orm) + Pug(For built-in template) + MySQL(Storage data) + Docker(Easy build and deploy) + TypeScript(Better than javascript)