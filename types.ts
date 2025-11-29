import React from 'react';

export enum ViewState {
  HOME = 'HOME',
  TURBID = 'TURBID',
  CANDYBUG = 'CANDYBUG'
}

export interface ParticleProps {
  count: number;
  mouse: React.MutableRefObject<[number, number]>;
}

export enum ShapeType {
  NEBULA = 0,
  ROSE = 1,
  SPIRAL = 2,
  LEMNISCATE = 3,
  BUTTERFLY = 4,
  KOCH = 5
}

export const SHAPE_Duration = 8000; // ms per shape