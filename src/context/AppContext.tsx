import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, Participant, Participation, Pitch, Team } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface AppContextType {
  teams: Team[];
  participants: Participant[];
  pitches: Pitch[];
  activities: Activity[];
  participations: Participation[];
  addTeam: (team: Omit<Team, "id">) => Promise<void>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addParticipant: (participant: Omit<Participant, "id">) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  toggleTeamParticipation: (activityId: string, teamId: string, completed: boolean) => Promise<void>;
  toggleParticipantParticipation: (activityId: string, teamId: string, participantId: string, completed: boolean) => Promise<void>;
  setQuantityParticipation: (activityId: string, teamId: string, quantity: number) => Promise<void>;
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

// Funciones auxiliares para mapear la BD a los tipos de TypeScript
const mapTeam = (row: any): Team => ({
  id: row.id, code: row.code, name: row.name, ambassador: row.ambassador,
  headquarters: row.headquarters, area: row.area, logoUrl: row.logo_url, active: row.active
});
const mapParticipant = (row: any): Participant => ({
  id: row.id, teamId: row.team_id, name: row.name,
  area: row.area, headquarters: row.headquarters, active: row.active
});
const mapParticipation = (row: any): Participation => ({
  id: row.id, activityId: row.activity_id, teamId: row.team_id,
  participantId: row.participant_id, quantity: row.quantity, points: row.points, date: row.date
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      const [teamsRes, partsRes, participationsRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("participants").select("*"),
        supabase.from("participations").select("*"),
      ]);

      if (teamsRes.data) setTeams(teamsRes.data.map(mapTeam));
      if (partsRes.data) setParticipants(partsRes.data.map(mapParticipant));
      if (participationsRes.data) setParticipations(participationsRes.data.map(mapParticipation));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTeam = async (team: Omit<Team, "id">) => {
    const { data, error } = await supabase.from("teams").insert({
      code: team.code, name: team.name, ambassador: team.ambassador,
      headquarters: team.headquarters, area: team.area, logo_url: team.logoUrl, active: team.active
    }).select().single();
    
    if (error) { showError("Error al crear equipo"); return; }
    if (data) { setTeams([...teams, mapTeam(data)]); showSuccess("Equipo creado"); }
  };

  const updateTeam = async (id: string, updatedFields: Partial<Team>) => {
    const dbFields = { logo_url: updatedFields.logoUrl, ...updatedFields };
    delete dbFields.logoUrl;

    const { error } = await supabase.from("teams").update(dbFields).eq("id", id);
    if (error) { showError("Error al actualizar"); return; }
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) { showError("Error al eliminar equipo"); return; }
    setTeams(teams.filter((t) => t.id !== id));
    setParticipants(participants.filter((p) => p.teamId !== id));
    setParticipations(participations.filter((p) => p.teamId !== id));
    showSuccess("Equipo eliminado");
  };

  const addParticipant = async (participant: Omit<Participant, "id">) => {
    const { data, error } = await supabase.from("participants").insert({
      team_id: participant.teamId, name: participant.name, 
      area: participant.area, headquarters: participant.headquarters, active: participant.active
    }).select().single();

    if (error) { showError("Error al agregar jugador"); return; }
    if (data) { setParticipants([...participants, mapParticipant(data)]); showSuccess("Jugador agregado"); }
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from("participants").delete().eq("id", id);
    if (error) { showError("Error al eliminar jugador"); return; }
    setParticipants(participants.filter((p) => p.id !== id));
    setParticipations(participations.filter((p) => p.participantId !== id));
  };

  const getTeamTotalPoints = (teamId: string) => {
    return participations.filter((p) => p.teamId === teamId).reduce((sum, p) => sum + p.points, 0);
  };

  const toggleTeamParticipation = async (activityId: string, teamId: string, completed: boolean) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const { data, error } = await supabase.from("participations").insert({
        activity_id: activityId, team_id: teamId, points: activity.points
      }).select().single();
      if (!error && data) setParticipations([...participations, mapParticipation(data)]);
    } else {
      await supabase.from("participations").delete().match({ activity_id: activityId, team_id: teamId });
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId)));
    }
  };

  const toggleParticipantParticipation = async (activityId: string, teamId: string, participantId: string, completed: boolean) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const { data, error } = await supabase.from("participations").insert({
        activity_id: activityId, team_id: teamId, participant_id: participantId, points: activity.points
      }).select().single();
      if (!error && data) setParticipations([...participations, mapParticipation(data)]);
    } else {
      await supabase.from("participations").delete().match({ activity_id: activityId, team_id: teamId, participant_id: participantId });
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId && p.participantId === participantId)));
    }
  };

  const setQuantityParticipation = async (activityId: string, teamId: string, quantity: number) => {
    const activity = defaultActivities.find((a) => a.id === activityId);
    if (!activity) return;

    const existing = participations.find((p) => p.activityId === activityId && p.teamId === teamId);
    
    if (quantity > 0) {
      const points = activity.points * quantity;
      if (existing) {
        const { data } = await supabase.from("participations").update({ quantity, points }).eq("id", existing.id).select().single();
        if (data) setParticipations(participations.map(p => p.id === existing.id ? mapParticipation(data) : p));
      } else {
        const { data } = await supabase.from("participations").insert({
          activity_id: activityId, team_id: teamId, quantity, points
        }).select().single();
        if (data) setParticipations([...participations, mapParticipation(data)]);
      }
    } else if (existing) {
      await supabase.from("participations").delete().eq("id", existing.id);
      setParticipations(participations.filter((p) => p.id !== existing.id));
    }
  };

  return (
    <AppContext.Provider
      value={{
        teams, participants, pitches: defaultPitches, activities: defaultActivities, participations,
        addTeam, updateTeam, deleteTeam, addParticipant, deleteParticipant,
        toggleTeamParticipation, toggleParticipantParticipation, setQuantityParticipation, getTeamTotalPoints,
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