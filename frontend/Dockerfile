FROM node:18

WORKDIR /app
RUN npm install -g serve
COPY build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
