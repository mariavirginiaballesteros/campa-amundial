import { Layout } from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flag, Star, Info } from "lucide-react";

const Activities = () => {
  const { 
    teams, 
    participants, 
    pitches, 
    activities, 
    participations,
    toggleTeamParticipation,
    toggleParticipantParticipation,
    setQuantityParticipation
  } = useAppContext();

  return (
    <Layout>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Flag className="text-primary w-6 h-6" /> 
          Canchas y Actividades
        </h2>
        <p className="text-muted-foreground">
          Selecciona una cancha y marca la participación de los equipos para sumar puntos.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border">
          <p className="text-gray-500">Primero debes crear equipos en la sección "Equipos" para poder cargarles puntaje.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {pitches.map((pitch) => {
              const pitchActivities = activities.filter(a => a.pitchId === pitch.id);
              
              return (
                <AccordionItem value={pitch.id} key={pitch.id} className="border rounded-lg px-4 bg-gray-50/50">
                  <AccordionTrigger className="hover:no-underline py-4 text-lg font-bold text-primary">
                    {pitch.name}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6 space-y-6">
                    {pitchActivities.map(activity => (
                      <div key={activity.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b pb-3">
                          <div>
                            <h4 className="font-bold text-md text-gray-800">{activity.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium uppercase">
                                {activity.type === 'team' ? 'Por Equipo' : activity.type === 'individual' ? 'Por Jugador' : 'Por Cantidad'}
                              </span>
                              {activity.description && (
                                <span className="text-xs flex items-center gap-1 text-gray-500">
                                  <Info className="w-3 h-3" /> {activity.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full text-secondary font-bold text-sm">
                            <Star className="w-4 h-4 fill-secondary" /> 
                            {activity.points} pts {activity.type === 'team' ? 'fijos' : 'c/u'}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {teams.map(team => {
                            // Render depending on activity type
                            if (activity.type === 'team') {
                              const isCompleted = participations.some(p => p.activityId === activity.id && p.teamId === team.id);
                              return (
                                <div key={team.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                  <Label htmlFor={`act-${activity.id}-team-${team.id}`} className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                      {team.code}
                                    </div>
                                    {team.name}
                                  </Label>
                                  <Checkbox 
                                    id={`act-${activity.id}-team-${team.id}`} 
                                    checked={isCompleted}
                                    onCheckedChange={(checked) => toggleTeamParticipation(activity.id, team.id, !!checked)}
                                    className="w-6 h-6 rounded-md border-gray-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                  />
                                </div>
                              );
                            }

                            if (activity.type === 'quantity') {
                              const participation = participations.find(p => p.activityId === activity.id && p.teamId === team.id);
                              const qty = participation?.quantity || 0;
                              return (
                                <div key={team.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                      {team.code}
                                    </div>
                                    <span className="font-medium text-sm">{team.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">Cant.</span>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      className="w-20 text-center font-bold" 
                                      value={qty || ''}
                                      placeholder="0"
                                      onChange={(e) => setQuantityParticipation(activity.id, team.id, parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-xs font-bold text-secondary w-16 text-right">
                                      = {qty * activity.points} pts
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            // Individual activity
                            const teamParticipants = participants.filter(p => p.teamId === team.id);
                            
                            return (
                              <Accordion type="single" collapsible key={team.id} className="w-full">
                                <AccordionItem value={`team-${team.id}`} className="border rounded-md px-3 mb-2">
                                  <AccordionTrigger className="py-2 hover:no-underline">
                                    <div className="flex items-center gap-3 text-sm">
                                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {team.code}
                                      </div>
                                      {team.name} <span className="text-gray-400 font-normal ml-2">({teamParticipants.length} jugadores)</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-2 pb-3 bg-slate-50 rounded-b-md px-2">
                                    {teamParticipants.length === 0 ? (
                                      <p className="text-xs text-gray-400 py-2 italic text-center">No hay jugadores cargados en este equipo.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {teamParticipants.map(participant => {
                                          const isCompleted = participations.some(p => p.activityId === activity.id && p.participantId === participant.id);
                                          return (
                                            <div key={participant.id} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                                              <Label htmlFor={`act-${activity.id}-part-${participant.id}`} className="text-sm cursor-pointer flex-1">
                                                {participant.name}
                                              </Label>
                                              <Checkbox 
                                                id={`act-${activity.id}-part-${participant.id}`} 
                                                checked={isCompleted}
                                                onCheckedChange={(checked) => toggleParticipantParticipation(activity.id, team.id, participant.id, !!checked)}
                                                className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                              />
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            );

                          })}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </Layout>
  );
};

export default Activities;