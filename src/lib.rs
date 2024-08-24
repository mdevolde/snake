use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;
use std::sync::Mutex;
use lazy_static::lazy_static;
mod game;
use game::*;

lazy_static! {
    static ref GAME: Mutex<Game> = Mutex::new(Game::new());
}

#[wasm_bindgen]
pub fn get_map_width() -> i32 {
    MAP_WIDTH
}

#[wasm_bindgen]
pub fn get_map_height() -> i32 {
    MAP_HEIGHT
}

#[wasm_bindgen]
pub fn get_up_key() -> u16 {
    UP_KEY
}

#[wasm_bindgen]
pub fn get_down_key() -> u16 {
    DOWN_KEY
}

#[wasm_bindgen]
pub fn get_left_key() -> u16 {
    LEFT_KEY
}

#[wasm_bindgen]
pub fn get_right_key() -> u16 {
    RIGHT_KEY
}

#[wasm_bindgen]
pub fn new_game() -> JsValue {
    let mut game = GAME.lock().unwrap();
    *game = Game::new();
    to_value(&*game).unwrap()
}

#[wasm_bindgen]
pub fn move_snake(direction: u16) -> JsValue {
    let mut game= GAME.lock().unwrap();

    game.snake.direction = Direction::new(direction, game.snake.clone());

    to_value(&*game).unwrap()
}

#[wasm_bindgen]
pub fn update_game() -> JsValue {
    let mut game = GAME.lock().unwrap();
    
    game.snake.move_snake();
    let actuel_head_position = game.snake.body[0].clone();
    let food = game.food.clone();
    if actuel_head_position == food {
        game.snake.eat();
        game.score += 1;
        let snake_clone = game.snake.clone();
        game.food = Point::new_food(Some(snake_clone));
    } else if actuel_head_position.x < 0
        || actuel_head_position.x > MAP_WIDTH - 1
        || actuel_head_position.y < 0
        || actuel_head_position.y > MAP_HEIGHT - 1
    {
        game.game_over = true;
    } else if game.snake.body[1..].contains(&actuel_head_position) {
        game.game_over = true;
    }

    to_value(&*game).unwrap()
}