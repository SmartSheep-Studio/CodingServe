FROM node:16-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package*.json ./
# RUN npm ci

COPY --chown=node:node . .
RUN npm install \
    && npm run build \
    && npm prune --production

FROM node:16-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/ui/ ./dist/ui/
COPY --from=builder --chown=node:node /home/node/templates/ ./dist/templates/
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma/

EXPOSE 3100

CMD ["node", "dist/src/main.js"]