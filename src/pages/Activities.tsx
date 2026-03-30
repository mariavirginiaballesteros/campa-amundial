import { Layout } from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, Star, Info, Edit2, Trash2, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { ActivityType } from "@/types";

const Activities = () => {
  const { 
    teams, participants, pitches, activities, participations,
    toggleTeamParticipation, toggleParticipantParticipation, setQuantityParticipation,
    addPitch, updatePitch, deletePitch, addActivity, updateActivity, deleteActivity, loadDefaultTemplate
  } = useAppContext();

  // Estados para modales de configuración
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<{id?: string, name: string}>({ name: "" });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{id?: string, pitchId: string, name: string, type: ActivityType, points: number, description: string}>({ 
    pitchId: "", name: "", type: "team", points: 10, description: "" 
  });

  const handleSavePitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPitch.id) updatePitch(editingPitch.id, editingPitch.name);
    else addPitch(editingPitch.name);
    setIsPitchModalOpen(false);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity.id) updateActivity(editingActivity.id, editingActivity);
    else addActivity(editingActivity);
    setIsActivityModalOpen(false);
  };

  return (
    <Layout>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Flag className="text-primary w-6 h-6" /> Canchas y Actividades
        </h2>
        <p className="text-muted-foreground">Gestiona las canchas del mundial y asigna puntos a los equipos.</p>
      </div>

      <Tabs defaultValue="assign" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
          <TabsTrigger value="assign" className="text-base">Asignar Puntos</TabsTrigger>
          <TabsTrigger value="config" className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" /> Configurar Canchas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          {teams.length === 0 && pitches.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
              <p className="text-blue-700 font-medium">👀 Aún no hay equipos creados.</p>
              <p className="text-blue-600 text-sm mt-1">Puedes visualizar las canchas aquí, pero necesitas ir a la pestaña "Equipos" para registrar planteles antes de poder sumarles puntos.</p>
            </div>
          )}

          {pitches.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed">
              <p className="text-gray-500 mb-4">No hay ninguna cancha configurada.</p>
              <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="config"]')?.click()}>
                Ir a Configurar Canchas
              </Button>
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
                        {pitchActivities.length === 0 && <p className="text-sm text-gray-400 italic">No hay actividades en esta cancha.</p>}
                        
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
                              {teams.length === 0 && <p className="text-xs text-gray-400 text-center">Registra equipos para asignar.</p>}
                              
                              {teams.map(team => {
                                if (activity.type === 'team') {
                                  const isCompleted = participations.some(p => p.activityId === activity.id && p.teamId === team.id);
                                  return (
                                    <div key={team.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                      <Label htmlFor={`act-${activity.id}-team-${team.id}`} className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{team.code}</div>
                                        {team.name}
                                      </Label>
                                      <Checkbox 
                                        id={`act-${activity.id}-team-${team.id}`} checked={isCompleted}
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
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{team.code}</div>
                                        <span className="font-medium text-sm">{team.name}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">Cant.</span>
                                        <Input 
                                          type="number" min="0" className="w-20 text-center font-bold" 
                                          value={qty || ''} placeholder="0"
                                          onChange={(e) => setQuantityParticipation(activity.id, team.id, parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-xs font-bold text-secondary w-16 text-right">= {qty * activity.points} pts</span>
                                      </div>
                                    </div>
                                  );
                                }

                                // Individual
                                const teamParticipants = participants.filter(p => p.teamId === team.id);
                                return (
                                  <Accordion type="single" collapsible key={team.id} className="w-full">
                                    <AccordionItem value={`team-${team.id}`} className="border rounded-md px-3 mb-2">
                                      <AccordionTrigger className="py-2 hover:no-underline">
                                        <div className="flex items-center gap-3 text-sm">
                                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{team.code}</div>
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
                                                  <Label htmlFor={`act-${activity.id}-part-${participant.id}`} className="text-sm cursor-pointer flex-1">{participant.name}</Label>
                                                  <Checkbox 
                                                    id={`act-${activity.id}-part-${participant.id}`} checked={isCompleted}
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
        </TabsContent>

        <TabsContent value="config">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Estructura del Mundial</h3>
              <p className="text-sm text-gray-500">Agrega o edita canchas y sus actividades con sus respectivos puntajes.</p>
            </div>
            <div className="flex gap-2">
              {pitches.length === 0 && (
                <Button variant="outline" onClick={loadDefaultTemplate} className="border-secondary text-secondary hover:bg-secondary/10">
                  Cargar Plantilla por Defecto
                </Button>
              )}
              <Button onClick={() => { setEditingPitch({ name: "" }); setIsPitchModalOpen(true); }} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Nueva Cancha
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {pitches.map(pitch => {
              const pitchActs = activities.filter(a => a.pitchId === pitch.id);
              return (
                <Card key={pitch.id} className="border-t-4 border-t-primary shadow-sm">
                  <CardHeader className="bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-primary">{pitch.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPitch(pitch); setIsPitchModalOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePitch(pitch.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {pitchActs.map(act => (
                        <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                          <div className="mb-2 sm:mb-0">
                            <h5 className="font-bold text-sm">{act.name}</h5>
                            <div className="flex items-center gap-2 text-xs mt-1">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                {act.type === 'team' ? 'Por Equipo' : act.type === 'individual' ? 'Por Jugador' : 'Multiplicador'}
                              </span>
                              <span className="font-bold text-secondary">{act.points} pts</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingActivity(act); setIsActivityModalOpen(true); }}>Editar</Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteActivity(act.id)}>Borrar</Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" size="sm" className="w-full mt-2 border-dashed"
                        onClick={() => { setEditingActivity({ pitchId: pitch.id, name: "", type: "team", points: 10, description: "" }); setIsActivityModalOpen(true); }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Agregar Actividad a esta cancha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Cancha */}
      <Dialog open={isPitchModalOpen} onOpenChange={setIsPitchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPitch.id ? "Editar Cancha" : "Nueva Cancha"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePitch} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre de la Cancha</Label>
              <Input required placeholder="Ej: Cancha 1 - El Vestuario" value={editingPitch.name} onChange={e => setEditingPitch({...editingPitch, name: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Actividad */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActivity.id ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveActivity} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre de la Actividad</Label>
              <Input required placeholder="Ej: El equipo titular" value={editingActivity.name} onChange={e => setEditingActivity({...editingActivity, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Asignación</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingActivity.type}
                  onChange={e => setEditingActivity({...editingActivity, type: e.target.value as ActivityType})}
                >
                  <option value="team">Por Equipo (Única vez)</option>
                  <option value="individual">Por Jugador (Individual)</option>
                  <option value="quantity">Por Cantidad (Multiplicador)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Puntos</Label>
                <Input required type="number" min="1" value={editingActivity.points} onChange={e => setEditingActivity({...editingActivity, points: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción / Ayuda (Opcional)</Label>
              <Input placeholder="Ej: 5 puntos por cada objeto" value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Guardar Actividad</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Activities;