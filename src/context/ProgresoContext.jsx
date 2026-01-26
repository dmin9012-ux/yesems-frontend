import { createContext, useState, useEffect, useCallback } from "react";
import { obtenerProgresoUsuario } from "../servicios/progresoService";
import { useAuth } from "./AuthContext";

export const ProgresoContext = createContext();

export const ProgresoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [progresoGlobal, setProgresoGlobal] = useState({});
  const [nivelesAprobadosGlobal, setNivelesAprobadosGlobal] = useState({});
  const [progresoCursos, setProgresoCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
      🔄 Cargar progreso desde backend
  =============================== */
  // Usamos useCallback para que pueda ser usado de forma segura en useEffects de otros componentes
  const cargarProgreso = useCallback(async () => {
    if (!isAuthenticated || !user || user.rol === "admin") {
      setLoading(false);
      return;
    }

    try {
      const res = await obtenerProgresoUsuario();

      if (res.ok && Array.isArray(res.data)) {
        const progresoObj = {};
        const nivelesObj = {};

        res.data.forEach((curso) => {
          progresoObj[curso.cursoId] = curso.leccionesCompletadas || [];
          nivelesObj[curso.cursoId] = curso.nivelesAprobados || [];
        });

        setProgresoGlobal(progresoObj);
        setNivelesAprobadosGlobal(nivelesObj);
        setProgresoCursos(res.data); 
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /* ===============================
      ➕ Actualizar progreso (Optimista)
  =============================== */
  const actualizarProgreso = (cursoId, leccionId) => {
    // Actualizamos el estado local para que la UI responda instantáneamente
    setProgresoGlobal((prev) => {
      const actuales = prev[cursoId] || [];
      if (actuales.includes(leccionId)) return prev;
      return { ...prev, [cursoId]: [...actuales, leccionId] };
    });

    // IMPORTANTE: Después de una actualización local, es buena idea 
    // disparar una recarga silenciosa del backend para asegurar sincronía
    // cargarProgreso(); 
  };

  /* ===============================
      ✅ Actualizar niveles aprobados
  =============================== */
  const actualizarNivelesAprobados = (cursoId, nivelNumero) => {
    setNivelesAprobadosGlobal((prev) => {
      const actuales = prev[cursoId] || [];
      if (actuales.includes(nivelNumero)) return prev;
      return { ...prev, [cursoId]: [...actuales, nivelNumero] };
    });
    
    // Al aprobar un nivel, forzamos recarga para obtener el nuevo estado de "completado"
    cargarProgreso();
  };

  useEffect(() => {
    cargarProgreso();
  }, [cargarProgreso]);

  return (
    <ProgresoContext.Provider
      value={{
        progresoGlobal,
        nivelesAprobadosGlobal,
        progresoCursos,
        actualizarProgreso,
        actualizarNivelesAprobados,
        recargarProgreso: cargarProgreso, // Esta es la que llama Perfil.jsx
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};