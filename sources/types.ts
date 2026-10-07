import { type } from 'arktype';

export const SourceType = type("'track'|'video'|'album'");
export type Source = typeof SourceType.infer;
