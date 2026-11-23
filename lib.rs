//! Empty wasm module. The game is the plain HTML/CSS/JS in the project folder;
//! this crate exists only so the Web tab's build pipeline has something to build.

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn start() {}
