import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, Participant, Participation, Pitch, Team } from "@/types";

interface AppContextType {
  teams: Team[];
  participants: Participant[];
  pitches: Pitch[];
  activities: Activity[];
  participations: Participation[];
  addTeam: (team: Omit<Team, "id">) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addParticipant: (participant: Omit<Participant, "id">) => void;
  deleteParticipant: (id: string) => void;
  toggleTeamParticipation: (activityId: string, teamId: string, completed: boolean) => void;
  toggleParticipantParticipation: (activityId: string, teamId: string, participantId: string, completed: boolean) => void;
  setQuantityParticipation: (activityId: string, teamId: string, quantity: number) => void;
  getTeamTotalPoints: (teamId: string) => number;
}

const defaultPitches: Pitch[] = [
  { id: "1", name: "Cancha 1 – El vestuario" },
  { id: "2", name: "Cancha 2 – El campo de juego" },
  { id: "3", name: "Cancha 3 – Juego limpio" },
  { id: "4", name: "Cancha 4 – Nuestra tribuna" },
];

const defaultActivities: Activity[] = [
  { id: "a1", pitchId: "1", name: "El equipo titular", type: "team", points: 100 },
  { id: "a2", pitchId: "1", name: "Ficha técnica actualizada", type: "team", points: 50 },
  { id: "a3", pitchId: "1", name: "Identidad del plantel: nombre y escudo", type: "team", points: 100 },
  { id: "a4", pitchId: "1", name: "El parche oficial", type: "team", points: 30 },
  { id: "a5", pitchId: "2", name: "Entrenamiento táctico", type: "individual", points: 20 },
  { id: "a6", pitchId: "2", name: "El reglamento del juego", type: "team", points: 40 },
  { id: "a7", pitchId: "2", name: "Fichas de jugada", type: "team", points: 40 },
  { id: "a8", pitchId: "3", name: "El reciclaje sale a la cancha", type: "team", points: 60 },
  { id: "a9", pitchId: "3", name: "La jugada solidaria del año", type: "quantity", points: 5, description: "5 pts por objeto" },
  { id: "a10", pitchId: "3", name: "Pausa táctica", type: "individual", points: 5 },
  { id: "a11", pitchId: "4", name: "El Pálpito: Acierto ganador/empate", type: "individual", points: 10 },
  { id: "a12", pitchId: "4", name: "El Pálpito: Acierto resultado exacto", type: "individual", points: 30 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);

  // Load from local storage
  useEffect(() => {
    const savedTeams = localStorage.getItem("cofarsur_teams");
    const savedParticipants = localStorage.getItem("cofarsur_participants");
    const savedParticipations = localStorage.getItem("cofarsur_participations");
    
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedParticipations) setParticipations(JSON.parse(savedParticipations));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("cofarsur_teams", JSON.stringify(teams));
    localStorage.setItem("cofarsur_participants", JSON.stringify(participants));
    localStorage.setItem("cofarsur_participations", JSON.stringify(participations));
  }, [teams, participants, participations]);

  const addTeam = (team: Omit<Team, "id">) => {
    setTeams([...teams, { ...team, id: Date.now().toString() }]);
  };

  const updateTeam = (id: string, updatedFields: Partial<Team>) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter((t) => t.id !== id));
    setParticipants(participants.filter((p) => p.teamId !== id));
    setParticipations(participations.filter((p) => p.teamId !== id));
  };

  const addParticipant = (participant: Omit<Participant, "id">) => {
    setParticipants([...participants, { ...participant, id: Date.now().toString() }]);
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
    setParticipations(participations.filter((p) => p.participantId !== id));
  };

  const getTeamTotalPoints = (teamId: string) => {
    return participations
      .filter((p) => p.teamId === teamId)
      .reduce((sum, p) => sum + p.points, 0);
  };

  const toggleTeamParticipation = (activityId: string, teamId: string, completed: boolean) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const newParticipation: Participation = {
        id: Date.now().toString(),
        activityId,
        teamId,
        points: activity.points,
        date: new Date().toISOString(),
      };
      setParticipations([...participations, newParticipation]);
    } else {
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId)));
    }
  };

  const toggleParticipantParticipation = (activityId: string, teamId: string, participantId: string, completed: boolean) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const newParticipation: Participation = {
        id: Date.now().toString(),
        activityId,
        teamId,
        participantId,
        points: activity.points,
        date: new Date().toISOString(),
      };
      setParticipations([...participations, newParticipation]);
    } else {
      setParticipations(
        participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId && p.participantId === participantId))
      );
    }
  };

  const setQuantityParticipation = (activityId: string, teamId: string, quantity: number) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    const existingIndex = participations.findIndex((p) => p.activityId === activityId && p.teamId === teamId);
    
    if (quantity > 0) {
      const updatedParticipation: Participation = {
        id: existingIndex >= 0 ? participations[existingIndex].id : Date.now().toString(),
        activityId,
        teamId,
        quantity,
        points: activity.points * quantity,
        date: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const newParticipations = [...participations];
        newParticipations[existingIndex] = updatedParticipation;
        setParticipations(newParticipations);
      } else {
        setParticipations([...participations, updatedParticipation]);
      }
    } else {
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId)));
    }
  };

  return (
    <AppContext.Provider
      value={{
        teams,
        participants,
        pitches: defaultPitches,
        activities: defaultActivities,
        participations,
        addTeam,
        updateTeam,
        deleteTeam,
        addParticipant,
        deleteParticipant,
        toggleTeamParticipation,
        toggleParticipantParticipation,
        setQuantityParticipation,
        getTeamTotalPoints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};