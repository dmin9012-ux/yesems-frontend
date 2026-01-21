import { useEffect, useState } from "react";
import { obtenerCursos } from "../services/cursosService";

function ListaCursos() {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerCursos().then(data => {
      setCursos(data);
      setCargando(false);
    });
  }, []);

  if (cargando) return <p>Cargando cursos...</p>;

  return (
    <div>
      <h2>Lista de Cursos</h2>
      <ul>
        {cursos.map(curso => (
          <li key={curso.id}>
            {curso.nombre} — {curso.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaCursos;
