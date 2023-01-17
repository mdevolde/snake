use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub snake: Snake,
    pub food: Point,
    pub score: u32,
    pub game_over: bool,
}

impl Game {
    pub fn new() -> Self {
        Game {
            snake: Snake::new(),
            food: Point::new_food(None),
            score: 0,
            game_over: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snake {
    pub body: Vec<Point>,
    pub direction: Direction,
}

impl Snake {
    pub fn new() -> Self {
        Snake {
            body: vec![Point::new(10, 10)],
            direction: Direction::Up,
        }
    }

    pub fn eat(&mut self) {
        if self.body.len() < 2 {
            let current_head = self.body[0];
            self.body.push(match self.direction {
                Direction::Up => Point::new(current_head.x, current_head.y + 1),
                Direction::Down => Point::new(current_head.x, current_head.y - 1),
                Direction::Left => Point::new(current_head.x + 1, current_head.y),
                Direction::Right => Point::new(current_head.x - 1, current_head.y),
            })
        } else {
            let before_last = self.body[self.body.len() - 2];
            let last = self.body.last().unwrap().clone(); // safe unwrap because we checked the length before

            if before_last.x == last.x && before_last.y < last.y {
                self.body.push(Point::new(last.x, last.y + 1));
            } else if before_last.x == last.x && before_last.y > last.y {
                self.body.push(Point::new(last.x, last.y - 1));
            } else if before_last.x < last.x && before_last.y == last.y {
                self.body.push(Point::new(last.x + 1, last.y));
            } else if before_last.x > last.x && before_last.y == last.y {
                self.body.push(Point::new(last.x - 1, last.y));
            }
        }
    }

    pub fn move_snake(&mut self) {
        let old_body = self.body.clone();
        self.body[0].next_position(None, Some(self.direction));

        for i in 1..self.body.len() {
            let previous_point = Some(old_body[i - 1]);
            self.body[i].next_position(previous_point, None);
        }
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

impl Direction {
    pub fn new(key: u16, snake: Snake) -> Self {
        let current = snake.direction;
        let direction = match key {
            37 => Self::Left,
            38 => Self::Up,
            39 => Self::Right,
            40 => Self::Down,
            _ => current,
        };
        if current.opposite(direction) && snake.body.len() > 1 {
            current
        } else {
            direction
        }
    }

    fn opposite(&self, other: Self) -> bool {
        match self {
            Self::Up => other == Self::Down,
            Self::Down => other == Self::Up,
            Self::Left => other == Self::Right,
            Self::Right => other == Self::Left,
        }
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

impl Point {
    pub fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }

    fn next_position(&mut self, previous_point: Option<Point>, direction: Option<Direction>) {
        let future_direction = match previous_point {
            Some(point) => {
                if point.x < self.x && point.y == self.y {
                    Some(Direction::Left)
                } else if point.x > self.x && point.y == self.y {
                    Some(Direction::Right)
                } else if point.x == self.x && point.y < self.y {
                    Some(Direction::Up)
                } else if point.x == self.x && point.y > self.y {
                    Some(Direction::Down)
                } else {
                    None
                }
            }
            None => direction,
        };

        match future_direction {
            Some(Direction::Up) => self.y -= 1,
            Some(Direction::Down) => self.y += 1,
            Some(Direction::Left) => self.x -= 1,
            Some(Direction::Right) => self.x += 1,
            None => {}
        }
    }

    pub fn new_food(snake: Option<Snake>) -> Self {
        let mut rng = rand::thread_rng();
        match snake {
            Some(snake) => {
                let mut new_food;
                loop {
                    let x = rng.gen_range(0..20);
                    let y = rng.gen_range(0..20);
                    new_food = Point::new(x, y);
                    if !snake.body.contains(&new_food) {
                        break;
                    }
                }
                new_food
            }
            None => {
                let x = rng.gen_range(0..20);
                let y = rng.gen_range(0..20);
                Point::new(x, y)
            }
        }
    }
}
