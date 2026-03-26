export type Pitch = {
  id: string;
  name: string;
};

export type ActivityType = "team" | "individual" | "quantity";

export type Activity = {
  id: string;
  pitchId: string;
  name: string;
  type: ActivityType;
  points: number;
  description?: string;
};

export type Team = {
  id: string;
  code: string;
  name: string;
  ambassador: string;
  headquarters: string;
  area: string;
  logoUrl?: string;
  active: boolean;
};

export type Participant = {
  id: string;
  teamId: string;
  name: string;
  area: string;
  headquarters: string;
  active: boolean;
};

export type Participation = {
  id: string;
  activityId: string;
  teamId: string;
  participantId?: string;
  quantity?: number;
  points: number;
  date: string;
};