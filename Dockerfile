FROM node:14-alpine as builder
WORKDIR /www
# COPY --chown=pn:pn package*.json .
COPY ["package*.json","./"]
RUN npm install --build-from-resource
# RUN npm install
COPY . .
RUN ls -la
RUN npm run build
ENV PATH /www/node_modules/.bin:$PATH


FROM node:14-alpine as runner
WORKDIR /app
ENV NODE_ENV production
# ADD . /www
# ENV APP_HOST $APP_HOST
# COPY . .
COPY --from=builder /www/node_modules ./node_modules
COPY --from=builder /www/dist .
# COPY app.js /app.js
# RUN npm run build 
RUN ls -la
# RUN yarn run publish
EXPOSE 4232
CMD ["node", "./app.js"]