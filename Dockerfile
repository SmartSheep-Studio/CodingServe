FROM node:16 as builder

# Create app directory
WORKDIR /app

# Copy needed file into image
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
# RUN npm install

COPY . .

# Download dependencies
RUN yarn install
# Generate prisma client
RUN yarn prisma generate
# Build app
RUN yarn run build

FROM node:16

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates/ ./templates/
COPY --from=builder /app/ui/ ./ui/
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD [ "node", "dist/src/main.js" ]
