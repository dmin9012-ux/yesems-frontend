import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading,
  } = useContext(ProgresoContext);

  useEffect(() => {
    const cargarCurso = async () => {
      try {
        await recargarProgreso();

        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.error("❌ Curso no encontrado");
          return;
        }

        setCurso(snap.data());
      } catch (error) {
        console.error("❌ Error cargando curso:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCurso();
  }, [id]);

  if (cargando || loading || !curso) {
    return (
      <>
        <TopBar />
        <p className="cargando">Cargando curso...</p>
      </>
    );
  }

  const leccionesCompletadas = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];

  const progresoCurso = progresoCursos.find((p) => p.cursoId === id);
  const cursoFinalizado = progresoCurso && progresoCurso.completado === true;

  return (
    <>
      <TopBar />

      <div className="curso-contenedor-sidebar">
        <aside className="sidebar">
          <h3>{curso.nombre}</h3>

          {curso.niveles.map((nivel) => {
            const nivelNumero = Number(nivel.numero);

            const nivelDesbloqueado =
              nivelNumero === 1 ||
              nivelesAprobados.includes(nivelNumero - 1);

            return (
              <div
                key={nivel.numero}
                className={
                  "nivel-sidebar " +
                  (!nivelDesbloqueado ? "nivel-bloqueado" : "")
                }
              >
                <p>
                  Nivel {nivel.numero}: {nivel.titulo}
                </p>

                <ul>
                  {nivel.lecciones.map((lec, index) => {
                    const leccionId =
                      id + "-n" + nivelNumero + "-l" + (index + 1);

                    const completada =
                      leccionesCompletadas.includes(leccionId);

                    return (
                      <li
                        key={leccionId}
                        className={completada ? "completada" : ""}
                      >
                        {nivelDesbloqueado ? (
                          <Link
                            to={`/curso/${id}/nivel/${nivelNumero}/leccion/${index + 1}`}
                          >
                            Lección {index + 1}: {lec.titulo}
                          </Link>
                        ) : (
                          <span>🔒 {lec.titulo}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {nivelDesbloqueado &&
                  !nivelesAprobados.includes(nivelNumero) && (
                    <button
                      className="btn-examen-sidebar"
                      onClick={() =>
                        navigate(
                          `/curso/${id}/nivel/${nivelNumero}/examen`
                        )
                      }
                    >
                      📝 Presentar examen
                    </button>
                  )}

                {nivelesAprobados.includes(nivelNumero) && (
                  <p className="nivel-aprobado">✅ Nivel aprobado</p>
                )}
              </div>
            );
          })}

          {cursoFinalizado && (
            <button
              className="btn-finalizar-curso"
              onClick={() => navigate("/perfil")}
            >
              🎓 Finalizar curso
            </button>
          )}

          <button
            className="btn-regresar-sidebar"
            onClick={() => navigate("/principal")}
          >
            ⬅ Regresar
          </button>
        </aside>

        <main className="contenido">
          <h2 className="curso-titulo">{curso.nombre}</h2>
          <p className="curso-descripcion">
            {curso.descripcion}
          </p>
        </main>
      </div>
    </>
  );
}
