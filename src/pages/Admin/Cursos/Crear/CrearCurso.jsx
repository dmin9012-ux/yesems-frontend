import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import "./CrearCursoStyle.css";

/* ===============================
   📦 ESTRUCTURA BASE
================================ */
const emptyCurso = () => ({
  id: "",
  nombre: "",
  imagenURL: "",
  descripcion: "",
  descripcionLarga: "",
  objetivos: [""],
  requisitos: [""],
  niveles: [
    {
      numero: 1,
      titulo: "",
      lecciones: [
        {
          id: "",
          titulo: "",
          videoURL: "",
          contenidoHTML: "",
          materiales: []
        }
      ],
      preguntas: []
    }
  ]
});

export default function CrearCurso() {
  const [curso, setCurso] = useState(emptyCurso());
  const navigate = useNavigate();

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

  const generarIdLeccion = (ni, li) =>
    `${curso.id}-n${ni + 1}-l${li + 1}`;

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

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({
      id: "",
      titulo: "",
      videoURL: "",
      contenidoHTML: "",
      materiales: []
    });
    setCurso(copy);
  };

  /* ===============================
     📄 MATERIALES PDF
  =============================== */
  const addMaterial = (ni, li) => {
    setCurso((prev) => {
      const niveles = [...prev.niveles];
      const lecciones = [...niveles[ni].lecciones];

      lecciones[li].materiales.push({
        id: `pdf-${Date.now()}`,
        titulo: "",
        tipo: "pdf",
        urlPreview: "",
        urlDownload: ""
      });

      niveles[ni].lecciones = lecciones;
      return { ...prev, niveles };
    });
  };

  const removeMaterial = (ni, li, mi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.splice(mi, 1);
    setCurso(copy);
  };

  /* ===============================
     ❓ PREGUNTAS DEL EXAMEN
  =============================== */
  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    if (!copy.niveles[ni].preguntas) copy.niveles[ni].preguntas = [];
    copy.niveles[ni].preguntas.push({
      id: `p-${Date.now()}`,
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
     💾 GUARDAR CURSO
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!curso.id || !curso.nombre) {
      alert("ID y nombre son obligatorios");
      return;
    }

    const cursoFinal = {
      ...curso,
      niveles: curso.niveles.map((n, ni) => ({
        ...n,
        lecciones: n.lecciones.map((l, li) => ({
          ...l,
          id: generarIdLeccion(ni, li)
        }))
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "cursos", curso.id), cursoFinal);
      alert("✅ Curso creado correctamente");
      navigate("/admin/cursos");
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar el curso");
    }
  };

  /* ===============================
     🧩 UI
  =============================== */
  return (
    <>
      <TopBarAdmin />

      <div className="crear-curso-container">
        <h1>Crear Curso</h1>

        <button
          type="button"
          className="btn-regresar"
          onClick={() => navigate("/admin/cursos")}
        >
          ← Regresar a cursos
        </button>

        <form onSubmit={handleSubmit}>
          {/* INFO GENERAL */}
          <section className="card">
            <label>ID del curso</label>
            <input placeholder="ID del curso" value={curso.id} onChange={(e) => setCurso({ ...curso, id: e.target.value })} />

            <label>Nombre del curso</label>
            <input placeholder="Nombre del curso" value={curso.nombre} onChange={(e) => setCurso({ ...curso, nombre: e.target.value })} />

            <label>Imagen URL</label>
            <input placeholder="URL de la imagen" value={curso.imagenURL} onChange={(e) => setCurso({ ...curso, imagenURL: e.target.value })} />

            <label>Descripción corta</label>
            <textarea placeholder="Descripción corta" value={curso.descripcion} onChange={(e) => setCurso({ ...curso, descripcion: e.target.value })} />

            <label>Descripción larga</label>
            <textarea placeholder="Descripción larga" value={curso.descripcionLarga} onChange={(e) => setCurso({ ...curso, descripcionLarga: e.target.value })} />

            <h4>🎯 Objetivos</h4>
            {curso.objetivos.map((o, i) => (
              <div key={i} className="inline-row">
                <input placeholder={`Objetivo ${i + 1}`} value={o} onChange={(e) => updateDeep(`objetivos.${i}`, e.target.value)} />
                {curso.objetivos.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem("objetivos", i)}>❌</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("objetivos")}>➕ Agregar objetivo</button>

            <h4>📌 Requisitos</h4>
            {curso.requisitos.map((r, i) => (
              <div key={i} className="inline-row">
                <input placeholder={`Requisito ${i + 1}`} value={r} onChange={(e) => updateDeep(`requisitos.${i}`, e.target.value)} />
                {curso.requisitos.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem("requisitos", i)}>❌</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("requisitos")}>➕ Agregar requisito</button>
          </section>

          {/* NIVELES */}
          {curso.niveles.map((nivel, ni) => (
            <section key={ni} className="card">
              <h3 className="nivel-titulo">Nivel {nivel.numero} - {nivel.titulo || "Título del nivel"}</h3>
              <input placeholder="Título del nivel" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />

              {/* LECCIONES */}
              {nivel.lecciones.map((lec, li) => (
                <div key={li} className="leccion-card">
                  <h4>Lección {li + 1}</h4>
                  <input placeholder="Título de la lección" value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                  <input placeholder="Video URL" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                  <textarea placeholder="Contenido HTML" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />
                  <button type="button" onClick={() => addMaterial(ni, li)}>📎 Agregar material</button>

                  {lec.materiales.map((mat, mi) => (
                    <div key={mat.id} className="material-card">
                      <input placeholder="Título PDF" value={mat.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.titulo`, e.target.value)} />
                      <input placeholder="URL Preview" value={mat.urlPreview} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlPreview`, e.target.value)} />
                      <input placeholder="URL Descarga" value={mat.urlDownload} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlDownload`, e.target.value)} />
                      <button type="button" onClick={() => removeMaterial(ni, li, mi)}>❌ Eliminar material</button>
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" onClick={() => addLeccion(ni)}>➕ Agregar lección</button>

              {/* PREGUNTAS */}
              <h4>❓ Preguntas del examen</h4>
              {nivel.preguntas?.map((preg, pi) => (
                <div key={preg.id} className="pregunta-card">
                  <input
                    placeholder="Pregunta"
                    value={preg.pregunta}
                    onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)}
                  />
                  {preg.opciones.map((opt, oi) => (
                    <div key={oi}>
                      <input
                        placeholder={`Opción ${oi + 1}`}
                        value={opt}
                        onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)}
                      />
                    </div>
                  ))}
                  <label>Correcta:</label>
                  <select
                    value={preg.correcta}
                    onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}
                  >
                    {preg.opciones.map((_, oi) => (
                      <option key={oi} value={oi}>Opción {oi + 1}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removePregunta(ni, pi)}>❌ Eliminar pregunta</button>
                </div>
              ))}
              <button type="button" onClick={() => addPregunta(ni)}>➕ Agregar pregunta</button>
            </section>
          ))}

          <button type="button" onClick={addNivel}>➕ Agregar nivel</button>
          <button className="btn-guardar">Guardar Curso</button>
        </form>
      </div>
    </>
  );
}
