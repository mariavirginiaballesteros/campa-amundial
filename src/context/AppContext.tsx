import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, Participant, Participation, Pitch, Team, ActivityType } from "@/types";
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
  // Nuevos métodos para Canchas y Actividades
  addPitch: (name: string) => Promise<void>;
  updatePitch: (id: string, name: string) => Promise<void>;
  deletePitch: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, "id">) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  loadDefaultTemplate: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mapeos
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
const mapPitch = (row: any): Pitch => ({ id: row.id, name: row.name });
const mapActivity = (row: any): Activity => ({
  id: row.id, pitchId: row.pitch_id, name: row.name, type: row.type as ActivityType, 
  points: row.points, description: row.description
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchData = async () => {
    try {
      const [teamsRes, partsRes, partRes, pitchesRes, actRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("participants").select("*"),
        supabase.from("participations").select("*"),
        supabase.from("pitches").select("*").order("created_at", { ascending: true }),
        supabase.from("activities").select("*").order("created_at", { ascending: true }),
      ]);

      if (teamsRes.data) setTeams(teamsRes.data.map(mapTeam));
      if (partsRes.data) setParticipants(partsRes.data.map(mapParticipant));
      if (partRes.data) setParticipations(partRes.data.map(mapParticipation));
      if (pitchesRes.data) setPitches(pitchesRes.data.map(mapPitch));
      if (actRes.data) setActivities(actRes.data.map(mapActivity));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- MÉTODOS DE EQUIPOS ---
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
    if (!error) setTeams(teams.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (!error) {
      setTeams(teams.filter((t) => t.id !== id));
      setParticipants(participants.filter((p) => p.teamId !== id));
      setParticipations(participations.filter((p) => p.teamId !== id));
      showSuccess("Equipo eliminado");
    }
  };

  const addParticipant = async (participant: Omit<Participant, "id">) => {
    const { data, error } = await supabase.from("participants").insert({
      team_id: participant.teamId, name: participant.name, 
      area: participant.area, headquarters: participant.headquarters, active: participant.active
    }).select().single();
    if (!error && data) { setParticipants([...participants, mapParticipant(data)]); showSuccess("Jugador agregado"); }
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from("participants").delete().eq("id", id);
    if (!error) {
      setParticipants(participants.filter((p) => p.id !== id));
      setParticipations(participations.filter((p) => p.participantId !== id));
    }
  };

  // --- MÉTODOS DE CANCHAS Y ACTIVIDADES ---
  const addPitch = async (name: string) => {
    const { data, error } = await supabase.from("pitches").insert({ name }).select().single();
    if (!error && data) { setPitches([...pitches, mapPitch(data)]); showSuccess("Cancha creada"); }
    else showError("Error al crear cancha");
  };

  const updatePitch = async (id: string, name: string) => {
    const { error } = await supabase.from("pitches").update({ name }).eq("id", id);
    if (!error) { setPitches(pitches.map(p => p.id === id ? { ...p, name } : p)); showSuccess("Cancha actualizada"); }
  };

  const deletePitch = async (id: string) => {
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    if (!error) {
      setPitches(pitches.filter(p => p.id !== id));
      setActivities(activities.filter(a => a.pitchId !== id));
      showSuccess("Cancha eliminada");
    } else showError("Error al eliminar");
  };

  const addActivity = async (activity: Omit<Activity, "id">) => {
    const { data, error } = await supabase.from("activities").insert({
      pitch_id: activity.pitchId, name: activity.name, type: activity.type, points: activity.points, description: activity.description
    }).select().single();
    if (!error && data) { setActivities([...activities, mapActivity(data)]); showSuccess("Actividad creada"); }
    else showError("Error al crear actividad");
  };

  const updateActivity = async (id: string, activity: Partial<Activity>) => {
    const { error } = await supabase.from("activities").update({
      name: activity.name, type: activity.type, points: activity.points, description: activity.description
    }).eq("id", id);
    if (!error) { setActivities(activities.map(a => a.id === id ? { ...a, ...activity } : a)); showSuccess("Actividad actualizada"); }
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (!error) {
      setActivities(activities.filter(a => a.id !== id));
      setParticipations(participations.filter(p => p.activityId !== id));
      showSuccess("Actividad eliminada");
    }
  };

  const loadDefaultTemplate = async () => {
    try {
      const template = [
        { name: "Cancha 1 – El vestuario", acts: [{ n: "El equipo titular", t: "team", p: 100 }, { n: "Ficha técnica", t: "team", p: 50 }] },
        { name: "Cancha 2 – El campo de juego", acts: [{ n: "Entrenamiento táctico", t: "individual", p: 20 }, { n: "Fichas de jugada", t: "team", p: 40 }] },
        { name: "Cancha 3 – Juego limpio", acts: [{ n: "El reciclaje sale a la cancha", t: "team", p: 60 }, { n: "Jugada solidaria", t: "quantity", p: 5, d: "5 pts por objeto" }] }
      ];

      for (const p of template) {
        const { data: pitch } = await supabase.from("pitches").insert({ name: p.name }).select().single();
        if (pitch) {
          for (const a of p.acts) {
            await supabase.from("activities").insert({ pitch_id: pitch.id, name: a.n, type: a.t, points: a.p, description: a.d || "" });
          }
        }
      }
      await fetchData();
      showSuccess("Plantilla cargada con éxito");
    } catch (e) {
      showError("Error al cargar la plantilla");
    }
  };

  // --- MÉTODOS DE PUNTOS ---
  const getTeamTotalPoints = (teamId: string) => participations.filter((p) => p.teamId === teamId).reduce((sum, p) => sum + p.points, 0);

  const toggleTeamParticipation = async (activityId: string, teamId: string, completed: boolean) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const { data, error } = await supabase.from("participations").insert({ activity_id: activityId, team_id: teamId, points: activity.points }).select().single();
      if (!error && data) setParticipations([...participations, mapParticipation(data)]);
    } else {
      await supabase.from("participations").delete().match({ activity_id: activityId, team_id: teamId });
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId)));
    }
  };

  const toggleParticipantParticipation = async (activityId: string, teamId: string, participantId: string, completed: boolean) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    if (completed) {
      const { data, error } = await supabase.from("participations").insert({ activity_id: activityId, team_id: teamId, participant_id: participantId, points: activity.points }).select().single();
      if (!error && data) setParticipations([...participations, mapParticipation(data)]);
    } else {
      await supabase.from("participations").delete().match({ activity_id: activityId, team_id: teamId, participant_id: participantId });
      setParticipations(participations.filter((p) => !(p.activityId === activityId && p.teamId === teamId && p.participantId === participantId)));
    }
  };

  const setQuantityParticipation = async (activityId: string, teamId: string, quantity: number) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;
    const existing = participations.find((p) => p.activityId === activityId && p.teamId === teamId);
    
    if (quantity > 0) {
      const points = activity.points * quantity;
      if (existing) {
        const { data } = await supabase.from("participations").update({ quantity, points }).eq("id", existing.id).select().single();
        if (data) setParticipations(participations.map(p => p.id === existing.id ? mapParticipation(data) : p));
      } else {
        const { data } = await supabase.from("participations").insert({ activity_id: activityId, team_id: teamId, quantity, points }).select().single();
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
        teams, participants, pitches, activities, participations,
        addTeam, updateTeam, deleteTeam, addParticipant, deleteParticipant,
        addPitch, updatePitch, deletePitch, addActivity, updateActivity, deleteActivity, loadDefaultTemplate,
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