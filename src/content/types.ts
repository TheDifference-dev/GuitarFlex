export type Exercise = {
  /** Benzersiz kimlik: `<teknik>-<seviye>-<sıra>` */
  id: string;
  title: string;
  description: string;
  tips: string[];
  /** alphaTex formatında tab (bkz. https://alphatab.net/docs/alphatex/introduction) */
  tex: string;
  startBpm: number;
  targetBpm: number;
};

export type Level = {
  level: number;
  title: string;
  goal: string;
  exercises: Exercise[];
};

export type Technique = {
  slug: string;
  name: string;
  icon: string;
  summary: string;
  levels: Level[];
};
