# syntax=docker/dockerfile:1

##
## Build
##
FROM rust:1.60 as build

RUN cargo new snake
WORKDIR /snake/

# Cache dependencies
COPY Cargo.lock ./
COPY Cargo.toml ./
RUN cargo build --release
RUN rm src/*

# Actual build
COPY src/ ./src/
RUN rm ./target/release/deps/snake*
RUN cargo build --release

##
## Deploy
##

CMD ["target/release/snake"]