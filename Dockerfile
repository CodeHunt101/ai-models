# Use official lightweight Node.js image.
# https://hub.docker.com/_/node
FROM node:22-alpine3.22

# Create app directory.
WORKDIR /usr/src/app

# Enable pnpm via Corepack.
RUN corepack enable

# Install app dependencies.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Bundle app source inside Docker image.
COPY . .

# Build Next.js app.
RUN pnpm build

# App binds to port 3001.
EXPOSE 3001

# Runtime command.
CMD [ "pnpm", "start" ]
