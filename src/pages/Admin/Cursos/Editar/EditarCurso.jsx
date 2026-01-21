import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import "./EditarCursoStyle.css";

export default function EditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     🔄 CARGAR CURSO
  =============================== */
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "cursos", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Curso no encontrado");
        navigate("/admin/cursos");
        return;
      }

      setCurso(snap.data());
      setLoading(false);
    };

    load();
  }, [id, navigate]);

  /* ===============================
     🔧 HELPERS
  =============================== */
  const updateDeep = (path, value) => {
    const copy = JSON.parse(JSON.stringify(curso));
    const parts = path.split(".");
    let current = copy;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[isNaN(parts[i]) ? parts[i] : Number(parts[i])];
    }
    current[parts.at(-1)] = value;
    setCurso(copy);
  };

  const addArrayItem = (field) =>
    setCurso((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArrayItem = (field, index) => {
    const copy = [...curso[field]];
    copy.splice(index, 1);
    setCurso({ ...curso, [field]: copy });
  };

  /* ===============================
     📚 NIVELES / LECCIONES
  =============================== */
  const addNivel = () =>
    setCurso((prev) => ({
      ...prev,
      niveles: [
        ...prev.niveles,
        { numero: prev.niveles.length + 1, titulo: "", lecciones: [], preguntas: [] }
      ]
    }));

  const removeNivel = (ni) => {
    const copy = [...curso.niveles];
    copy.splice(ni, 1);
    setCurso({
      ...curso,
      niveles: copy.map((n, i) => ({ ...n, numero: i + 1 }))
    });
  };

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({
      id: crypto.randomUUID(),
      titulo: "",
      videoURL: "",
      contenidoHTML: "",
      materiales: []
    });
    setCurso(copy);
  };

  const removeLeccion = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.splice(li, 1);
    setCurso(copy);
  };

  /* ===============================
     📎 MATERIALES
  =============================== */
  const addMaterial = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.push({
      id: crypto.randomUUID(),
      titulo: "",
      tipo: "pdf",
      urlPreview: "",
      urlDownload: ""
    });
    setCurso(copy);
  };

  const removeMaterial = (ni, li, mi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.splice(mi, 1);
    setCurso(copy);
  };

  /* ===============================
     ❓ PREGUNTAS
  =============================== */
  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.push({
      id: crypto.randomUUID(),
      pregunta: "",
      opciones: ["", "", "", ""],
      correcta: 0
    });
    setCurso(copy);
  };

  const removePregunta = (ni, pi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.splice(pi, 1);
    setCurso(copy);
  };

  /* ===============================
     💾 GUARDAR
  =============================== */
  const handleSave = async () => {
    await setDoc(doc(db, "cursos", id), {
      ...curso,
      updatedAt: serverTimestamp()
    });

    alert("✅ Curso actualizado");
    navigate("/admin/cursos");
  };

  if (loading) return <p>Cargando...</p>;
  if (!curso) return null;

  /* ===============================
     🧩 UI
  =============================== */
  return (
    <>
      <TopBarAdmin />
      <div className="editar-curso-container">
        <h1>Editar Curso</h1>

        <button
          type="button"
          className="btn-regresar"
          onClick={() => navigate("/admin/cursos")}
        >
          ← Regresar a cursos
        </button>

        {/* INFO GENERAL */}
        <section className="card">
          <label>Nombre</label>
          <input placeholder="Nombre del curso" value={curso.nombre} onChange={(e) => updateDeep("nombre", e.target.value)} />

          <label>Imagen URL</label>
          <input placeholder="URL de la imagen" value={curso.imagenURL} onChange={(e) => updateDeep("imagenURL", e.target.value)} />

          <label>Descripción corta</label>
          <textarea placeholder="Descripción corta" value={curso.descripcion} onChange={(e) => updateDeep("descripcion", e.target.value)} />

          <label>Descripción larga</label>
          <textarea placeholder="Descripción larga" value={curso.descripcionLarga} onChange={(e) => updateDeep("descripcionLarga", e.target.value)} />

          <h4>🎯 Objetivos</h4>
          {curso.objetivos.map((o, i) => (
            <div key={i} className="inline-row">
              <input placeholder={`Objetivo ${i + 1}`} value={o} onChange={(e) => updateDeep(`objetivos.${i}`, e.target.value)} />
              <button onClick={() => removeArrayItem("objetivos", i)}>❌</button>
            </div>
          ))}
          <button onClick={() => addArrayItem("objetivos")}>➕ Agregar objetivo</button>

          <h4>📌 Requisitos</h4>
          {curso.requisitos.map((r, i) => (
            <div key={i} className="inline-row">
              <input placeholder={`Requisito ${i + 1}`} value={r} onChange={(e) => updateDeep(`requisitos.${i}`, e.target.value)} />
              <button onClick={() => removeArrayItem("requisitos", i)}>❌</button>
            </div>
          ))}
          <button onClick={() => addArrayItem("requisitos")}>➕ Agregar requisito</button>
        </section>

        {/* NIVELES */}
        {curso.niveles.map((nivel, ni) => (
          <section key={ni} className="card">
            <h3 className="nivel-titulo">Nivel {nivel.numero} - {nivel.titulo || "Título del nivel"}</h3>
            <input placeholder="Título del nivel" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />

            {/* LECCIONES */}
            {nivel.lecciones.map((lec, li) => (
              <div key={lec.id} className="leccion-card">
                <input placeholder={`Título lección ${li + 1}`} value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                <input placeholder="Video URL" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                <textarea placeholder="Contenido HTML" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />

                <button onClick={() => addMaterial(ni, li)}>📎 Agregar material</button>
                {lec.materiales.map((mat, mi) => (
                  <div key={mat.id} className="material-card">
                    <input placeholder="Título PDF" value={mat.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.titulo`, e.target.value)} />
                    <input placeholder="URL Preview" value={mat.urlPreview} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlPreview`, e.target.value)} />
                    <input placeholder="URL Descarga" value={mat.urlDownload} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlDownload`, e.target.value)} />
                    <button onClick={() => removeMaterial(ni, li, mi)}>❌ Eliminar material</button>
                  </div>
                ))}

                <button onClick={() => removeLeccion(ni, li)}>🗑 Eliminar lección</button>
              </div>
            ))}
            <button onClick={() => addLeccion(ni)}>➕ Agregar lección</button>

            {/* PREGUNTAS */}
            <h4>❓ Preguntas</h4>
            {nivel.preguntas.map((p, pi) => (
              <div key={p.id} className="pregunta-card">
                <input placeholder="Pregunta" value={p.pregunta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)} />
                {p.opciones.map((op, oi) => (
                  <input
                    key={oi}
                    placeholder={`Opción ${oi + 1}`}
                    value={op}
                    onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)}
                  />
                ))}
                <select
                  value={p.correcta}
                  onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}
                >
                  {p.opciones.map((_, oi) => (
                    <option key={oi} value={oi}>Opción {oi + 1}</option>
                  ))}
                </select>
                <button onClick={() => removePregunta(ni, pi)}>❌ Eliminar pregunta</button>
              </div>
            ))}
            <button onClick={() => addPregunta(ni)}>➕ Agregar pregunta</button>

            <button onClick={() => removeNivel(ni)}>🗑 Eliminar nivel</button>
          </section>
        ))}

        <button onClick={addNivel}>➕ Agregar nivel</button>
        <button className="btn-guardar" onClick={handleSave}>Guardar cambios</button>
      </div>
    </>
  );
}
