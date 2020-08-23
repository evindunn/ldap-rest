FROM node:12

WORKDIR /app
ADD . /app
RUN npm i && npm run build

FROM node:12

ENV APP_PORT=8080
ENV LDAP_URI=""
ENV LDAP_BIND_DN=""
ENV LDAP_BIND_PASSWORD=""
ENV LDAP_BASE_DN=""
ENV LDAP_USERNAME_ATTRIBUTE=sAMAccountName
ENV LDAP_TLS_VERIFY=true

WORKDIR /app
COPY --from=0 /app/package.json /app/
COPY --from=0 /app/dist /app/dist

RUN npm i --only=production

CMD ["npm", "run", "start:prod"]
