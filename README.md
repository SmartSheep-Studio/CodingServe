# LumbaShark

LumbaShark is a very sharp Authorization management system, compatible with OAuth2 Authorization Code mode

## Getting Start

1. Pulling our docker image
2. Run the docker image

```bash
# With out daemon
docker run --name lumbashark -p 3100:3100 -e DATABASE_URL="mysql://root:root@192.168.50.215:3306/lumbashark?schema=public" lumbashark:latest
# With in daemon
docker run --name lumbashark -p 3100:3100 -e DATABASE_URL="mysql://root:root@192.168.50.215:3306/lumbashark?schema=public" -d lumbashark:latest
# Start when server start
docker run --name lumbashark -p 3100:3100 -e DATABASE_URL="mysql://root:root@192.168.50.215:3306/lumbashark?schema=public" --restart=always -d lumbashark:latest
```

3. Init scheme for the database(Upgrade with out this step)

```bash
docker exec -it <Your container id> /bin/sh
yarn prisma db push
```

4. All are done!

## Authenticate

### Groups

Now we available user group is:

1. Common User
2. Developer
3. Super Admin **(Optional)**

Common User is default registered user will joined(Didn't join any group `group_id=0`). Common Users can grant access for other developers create applications.

Developer is didn't join any group user can register. Developers can register new OAuth client for them project use.

Super Admin usually have all the permissions, they can manage all things of the LumbaShark authorization system.

### OAuth Scopes

Now we have scopes are these:

1. `all` Can access all things for you
2. `read:profile` Can read your profile(Includes email, user set profile(address, gender), create date...) by **Profile Controller**
3. `write:developer` Can create client for developer
4. `read:developer` Can read developers created clients

Tips: If grant access account didn't have permission to access area, the OAuth client can't access yet.