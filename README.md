# Snake

This is a simple snake game written in rust using wasm.

## How to play

Use the arrow keys to move the snake around the screen. The snake will grow when it eats the food. The game ends when the snake collides with the walls or itself.

## How to run

Before you can run the project, you need to install `wasm-pack`.

Then you can build the project by running:

```bash
cargo build --target wasm32-unknown-unknown --release
```

After that, you need to generate the files about the wasm module by running:

```bash
wasm-bindgen --out-dir /static/out --target web ./target/wasm32-unknown-unknown/release/snake.wasm
```

Finally, you can run the project by running:
(Ensuring you have set a python environment with `requirements.txt` installed)
```bash
python app.py
```

Enjoy the game!

## Deployment
There is a `Dockerfile` that you can use to deploy the project.
There is also a `captain-definition` file that you can use to deploy the project on CapRover.
