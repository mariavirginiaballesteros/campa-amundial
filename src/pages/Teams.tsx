import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Edit2 } from "lucide-react";

const Teams = () => {
  const { teams, participants, addTeam, deleteTeam, addParticipant, deleteParticipant } = useAppContext();
  
  // States para el formulario de equipo
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ code: "", name: "", ambassador: "", headquarters: "", area: "", active: true });

  // States para participantes
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [newParticipant, setNewParticipant] = useState({ name: "", area: "", headquarters: "" });

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam(newTeam);
    setNewTeam({ code: "", name: "", ambassador: "", headquarters: "", area: "", active: true });
    setIsTeamModalOpen(false);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTeamId) {
      addParticipant({ ...newParticipant, teamId: activeTeamId, active: true });
      setNewParticipant({ name: "", area: "", headquarters: "" });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Equipos de la Campaña</h2>
          <p className="text-muted-foreground">Administra los planteles y sus jugadores.</p>
        </div>
        
        <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" /> Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar nuevo equipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeam} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código / Número corto</Label>
                  <Input required placeholder="Ej: EQ01" value={newTeam.code} onChange={e => setNewTeam({...newTeam, code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Nombre del Equipo</Label>
                  <Input required placeholder="Ej: Los Invencibles" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Embajador</Label>
                  <Input required placeholder="Nombre embajador" value={newTeam.ambassador} onChange={e => setNewTeam({...newTeam, ambassador: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Sede</Label>
                  <Input required placeholder="Ej: Casa Central" value={newTeam.headquarters} onChange={e => setNewTeam({...newTeam, headquarters: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Área principal</Label>
                  <Input required placeholder="Ej: Logística" value={newTeam.area} onChange={e => setNewTeam({...newTeam, area: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Guardar Equipo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const teamParticipants = participants.filter(p => p.teamId === team.id);
          
          return (
            <Card key={team.id} className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-secondary mb-1">{team.code}</div>
                    <CardTitle className="text-xl text-primary">{team.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Embajador: <span className="font-semibold text-gray-700">{team.ambassador}</span></p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteTeam(team.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {teamParticipants.length} Jugadores
                  </span>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setActiveTeamId(team.id)}>
                        Gestionar Plantel
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Plantel de {team.name}</DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleAddParticipant} className="flex gap-2 items-end pt-4 pb-4 border-b">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Nombre</Label>
                          <Input required placeholder="Nuevo jugador" value={newParticipant.name} onChange={e => setNewParticipant({...newParticipant, name: e.target.value})} />
                        </div>
                        <Button type="submit" size="icon" className="bg-secondary hover:bg-secondary/90 text-white shrink-0"><Plus className="w-4 h-4" /></Button>
                      </form>

                      <div className="max-h-[300px] overflow-y-auto space-y-2 py-2">
                        {teamParticipants.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 py-4">Sin jugadores registrados.</p>
                        ) : (
                          teamParticipants.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 border">
                              <span className="text-sm font-medium">{p.name}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => deleteParticipant(p.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{team.headquarters}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{team.area}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
};

export default Teams;