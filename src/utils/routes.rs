use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::{Html, IntoResponse, Redirect},
};
use futures::{
    sink::SinkExt,
    stream::{SplitSink, SplitStream, StreamExt},
};
use std::sync::{Arc, Mutex};

use super::models::*;

pub async fn index() -> Html<String> {
    Html(include_str!("../html/index.html").to_string())
}

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(move |socket| game_state(socket))
}

pub async fn game_state(socket: WebSocket) {
    async fn send_state(mut sender: SplitSink<WebSocket, Message>, game: Arc<Mutex<Game>>) {
        loop {
            let food = game.lock().unwrap().food.clone();

            game.lock().unwrap().snake.move_snake();

            let actuel_head_position = game.lock().unwrap().snake.body[0].clone();

            if actuel_head_position == food {
                game.lock().unwrap().snake.eat();
                game.lock().unwrap().score += 1;
                let snake_clone = game.lock().unwrap().snake.clone();
                game.lock().unwrap().food = Point::new_food(Some(snake_clone));
            } else if actuel_head_position.x < 0
                || actuel_head_position.x > 19
                || actuel_head_position.y < 0
                || actuel_head_position.y > 19
            {
                game.lock().unwrap().game_over = true;
            } else if game.lock().unwrap().snake.body[1..].contains(&actuel_head_position) {
                game.lock().unwrap().game_over = true;
            }

            let to_send = serde_json::to_string(&game.lock().unwrap().clone()).unwrap();

            if sender
                .send(Message::Text(to_send.to_string()))
                .await
                .is_err()
            {
                break;
            }

            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
    }

    async fn get_keys(mut receiver: SplitStream<WebSocket>, game: Arc<Mutex<Game>>) {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(string_received) = msg {
                let key = string_received.parse::<usize>().unwrap();
                let direction = Direction::new(key, game.lock().unwrap().snake.clone());
                game.lock().unwrap().snake.direction = direction;
            }
        }
    }

    let (sender, receiver) = socket.split();

    let game = Arc::new(Mutex::new(Game::new()));

    let mut send_task = tokio::spawn(send_state(sender, game.clone()));
    let mut recv_task = tokio::spawn(get_keys(receiver, game.clone()));

    tokio::select! {
        _ = (&mut recv_task) => send_task.abort(),
        _ = (&mut send_task) => recv_task.abort(),
    };
}

pub async fn fallback() -> Redirect {
    Redirect::to("/")
}
