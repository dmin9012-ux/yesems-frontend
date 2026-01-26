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

  // 🔄 Cargar progreso desde backend (memoizado para no generar loops)
  const cargarProgreso = useCallback(async () => {
    if (!isAuthenticated || !user || user.rol === "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);

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
  }, [user, isAuthenticated]);

  // ➕ Actualizar progreso local
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const prevCurso = prev[cursoId] || [];
      if (prevCurso.includes(leccionId)) return prev;

      const nuevoProgresoGlobal = {
        ...prev,
        [cursoId]: [...prevCurso, leccionId],
      };

      setProgresoCursos((prevCursos) => {
        const index = prevCursos.findIndex((c) => c.cursoId === cursoId);
        if (index === -1) return prevCursos;

        const cursoPrev = prevCursos[index];
        const lecciones = cursoPrev.leccionesCompletadas || [];
        if (lecciones.includes(leccionId)) return prevCursos;

        const totalLecciones = cursoPrev.totalLecciones ?? lecciones.length + 1;

        const cursoActualizado = {
          ...cursoPrev,
          leccionesCompletadas: [...lecciones, leccionId],
          completado: lecciones.length + 1 >= totalLecciones,
        };

        const nuevosCursos = [...prevCursos];
        nuevosCursos[index] = cursoActualizado;
        return nuevosCursos;
      });

      return nuevoProgresoGlobal;
    });
  };

  // ✅ Actualizar niveles aprobados localmente
  const actualizarNivelesAprobados = (cursoId, nivelNumero) => {
    setNivelesAprobadosGlobal((prev) => {
      const prevNiveles = prev[cursoId] || [];
      if (prevNiveles.includes(nivelNumero)) return prev;

      return {
        ...prev,
        [cursoId]: [...prevNiveles, nivelNumero],
      };
    });
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
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
