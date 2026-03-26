import { Layout } from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { Trophy, Medal, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { teams, getTeamTotalPoints } = useAppContext();

  // Calcular puntos y ordenar de mayor a menor
  const rankedTeams = teams
    .map((team) => ({
      ...team,
      totalPoints: getTeamTotalPoints(team.id),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <Layout>
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="text-3xl font-extrabold text-primary mb-2 flex items-center gap-2">
          <Trophy className="text-secondary w-8 h-8" /> 
          Ranking de Equipos
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Sigue el progreso de todos los planteles en tiempo real. ¡El equipo con más puntos levanta la copa!
        </p>
      </div>

      {rankedTeams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">Aún no hay equipos</h3>
          <p className="text-gray-400">Dirígete a la pestaña "Equipos" para registrar el primer plantel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedTeams.map((team, index) => (
            <Card 
              key={team.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg border-t-4
                ${index === 0 ? 'border-t-yellow-400 bg-yellow-50/30' : 
                  index === 1 ? 'border-t-gray-400' : 
                  index === 2 ? 'border-t-amber-700' : 'border-t-primary/20'}
              `}
            >
              <div className="absolute top-0 right-0 p-3 flex flex-col items-end">
                {index === 0 && <Medal className="w-8 h-8 text-yellow-500" />}
                {index === 1 && <Medal className="w-8 h-8 text-gray-400" />}
                {index === 2 && <Medal className="w-8 h-8 text-amber-700" />}
                <span className="text-4xl font-black text-gray-900/10 mt-2">#{index + 1}</span>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20 shadow-inner">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      team.code || "FC"
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight pr-12">{team.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">Embajador: {team.ambassador}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{team.headquarters}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[120px]">{team.area}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-gray-500 text-sm font-medium">Puntaje Total</span>
                    <span className="text-3xl font-black text-secondary flex items-center gap-1">
                      {team.totalPoints} <Star className="w-5 h-5 fill-secondary" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Index;