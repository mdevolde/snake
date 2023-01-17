use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::{Html, IntoResponse, Redirect},
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use tokio::sync::Mutex;

use super::models::*;

pub async fn index() -> Html<&'static str> {
    Html(include_str!("../html/index.html"))
}

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(move |socket| game_state(socket))
}

pub async fn game_state(socket: WebSocket) {
    let (mut sender, mut receiver) = socket.split();
    let game = Arc::new(Mutex::new(Game::new()));

    let send_game = game.clone();
    let mut send_task = tokio::spawn(async move {
        loop {
            send_game.lock().await.snake.move_snake();

            let actuel_head_position = send_game.lock().await.snake.body[0].clone();
            let food = send_game.lock().await.food.clone();
            if actuel_head_position == food {
                send_game.lock().await.snake.eat();
                send_game.lock().await.score += 1;
                let snake_clone = send_game.lock().await.snake.clone();
                send_game.lock().await.food = Point::new_food(Some(snake_clone));
            } else if actuel_head_position.x < 0
                || actuel_head_position.x > 19
                || actuel_head_position.y < 0
                || actuel_head_position.y > 19
            {
                send_game.lock().await.game_over = true;
            } else if send_game.lock().await.snake.body[1..].contains(&actuel_head_position) {
                send_game.lock().await.game_over = true;
            }

            let to_send = serde_json::to_string(&send_game.lock().await.clone())
                .expect("Failed to serialize game.");
            if sender
                .send(Message::Text(to_send.to_string()))
                .await
                .is_err()
            {
                break;
            }

            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(string_received) = msg {
                let key = string_received.parse::<u16>().unwrap();
                let direction = Direction::new(key, game.lock().await.snake.clone());
                game.lock().await.snake.direction = direction;
            }
        }
    });

    tokio::select! {
        _ = (&mut recv_task) => send_task.abort(),
        _ = (&mut send_task) => recv_task.abort(),
    };
}

pub async fn fallback() -> Redirect {
    Redirect::to("/")
}
