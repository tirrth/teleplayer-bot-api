# FROM alpine:3.13
FROM node:15.11.0-alpine3.10

# RUN apk update && \
#     apk upgrade

# RUN apk add --update \
#     alpine-sdk \
#     libstdc++ \
#     linux-headers \
#     git \
#     zlib-dev \
#     openssl \
#     openssl-dev \
#     gperf \
#     php7 \
#     php7-ctype \
#     cmake && \
#     php --version && \
#     git clone --recursive https://github.com/tdlib/telegram-bot-api.git && \
#     cd telegram-bot-api && \
#     rm -rf build && \
#     mkdir build && \
#     cd build && \
#     export CXXFLAGS="" && \
#     cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=.. .. && \
#     cmake --build . --target prepare_cross_compiling && \
#     cd ../td && \
#     php SplitSource.php && \
#     cd ../build && \
#     cmake --build . --target install && \
#     cd ../td && \
#     php7 SplitSource.php --undo && \
#     cd ../.. && \
#     ls -l /telegram-bot-api/bin/telegram-bot-api*

WORKDIR /app

COPY package.json /app
RUN ["npm", "install"]

COPY . /app

# RUN rm -rf public/telegram-api-bot-server && \
#     mkdir public/telegram-api-bot-server && \ 
#     cp /telegram-bot-api/bin/telegram-bot-api public/telegram-api-bot-server/telegram-bot-api && \
#     rm -rf telegram-bot-api


######### Permit shell script to execute #########
RUN chmod +x ./server-script.sh
######### Execute shell script #########
ENTRYPOINT ["./server-script.sh" ]

# CMD [ "npm", "start" ]
