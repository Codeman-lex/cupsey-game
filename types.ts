export enum GameStatus {
  START = 'START',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface PipeData {
  id: number;
  x: number;
  topHeight: number; // Height of the top pipe
  passed: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
}