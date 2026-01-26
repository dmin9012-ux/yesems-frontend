import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { notify } from "../../../../Util/toast"; // 👈 Sincronización con Toasts
import { Save, Plus, Trash2, ArrowLeft, Video, HelpCircle, FileText } from "lucide-react";
import "./CrearCursoStyle.css";

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
      lecciones: [{ id: "", titulo: "", videoURL: "", contenidoHTML: "", materiales: [] }],
      preguntas: []
    }
  ]
});

export default function CrearCurso() {
  const [curso, setCurso] = useState(emptyCurso());
  const navigate = useNavigate();

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

  const generarIdLeccion = (ni, li) => `${curso.id}-n${ni + 1}-l${li + 1}`;

  const addNivel = () =>
    setCurso((prev) => ({
      ...prev,
      niveles: [...prev.niveles, { numero: prev.niveles.length + 1, titulo: "", lecciones: [], preguntas: [] }]
    }));

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({ id: "", titulo: "", videoURL: "", contenidoHTML: "", materiales: [] });
    setCurso(copy);
  };

  const addMaterial = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.push({
      id: `pdf-${Date.now()}`, titulo: "", tipo: "pdf", urlPreview: "", urlDownload: ""
    });
    setCurso(copy);
  };

  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    if (!copy.niveles[ni].preguntas) copy.niveles[ni].preguntas = [];
    copy.niveles[ni].preguntas.push({
      id: `p-${Date.now()}`, pregunta: "", opciones: ["", "", "", ""], correcta: 0
    });
    setCurso(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!curso.id || !curso.nombre) {
      return notify("warning", "El ID y el Nombre son obligatorios");
    }

    const cursoFinal = {
      ...curso,
      niveles: curso.niveles.map((n, ni) => ({
        ...n,
        lecciones: n.lecciones.map((l, li) => ({ ...l, id: generarIdLeccion(ni, li) }))
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "cursos", curso.id), cursoFinal);
      notify("success", "¡Curso creado exitosamente! 🚀");
      navigate("/admin/cursos");
    } catch (err) {
      notify("error", "Error al guardar en la base de datos");
    }
  };

  return (
    <div className="admin-layout">
      <TopBarAdmin />
      <div className="crear-curso-main">
        <header className="admin-header-sticky">
          <div className="title-section">
            <button className="btn-back-circle" onClick={() => navigate("/admin/cursos")}><ArrowLeft /></button>
            <h1>Nuevo Curso</h1>
          </div>
          <button className="btn-save-master" onClick={handleSubmit}>
            <Save size={18} /> Publicar Curso
          </button>
        </header>

        <form className="editor-grid">
          <aside className="editor-aside">
            <section className="admin-card">
              <h3><FileText size={18} /> Identificación</h3>
              <div className="input-group">
                <label>ID Único (slug-del-curso)</label>
                <input required placeholder="ej: medicina-basica" value={curso.id} onChange={(e) => setCurso({ ...curso, id: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Nombre Público</label>
                <input required placeholder="Nombre del curso" value={curso.nombre} onChange={(e) => setCurso({ ...curso, nombre: e.target.value })} />
              </div>
              <div className="input-group">
                <label>URL Imagen</label>
                <input placeholder="https://..." value={curso.imagenURL} onChange={(e) => setCurso({ ...curso, imagenURL: e.target.value })} />
              </div>
            </section>
          </aside>

          <main className="editor-content">
            {curso.niveles.map((nivel, ni) => (
              <section key={ni} className="nivel-block">
                <div className="nivel-header">
                  <h2>Nivel {nivel.numero}</h2>
                  <input className="nivel-input-titulo" placeholder="Título del Nivel" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />
                </div>

                <div className="nivel-body">
                  <div className="section-title"><Video size={16}/> Lecciones</div>
                  {nivel.lecciones.map((lec, li) => (
                    <div key={li} className="leccion-editor-card">
                      <input className="input-lec-titulo" placeholder="Título de la lección" value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                      <input placeholder="URL del Video" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                      <textarea placeholder="Contenido HTML / Instrucciones" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />
                      
                      <button type="button" className="btn-add-material" onClick={() => addMaterial(ni, li)}>📎 Adjuntar PDF</button>
                      {lec.materiales.map((mat, mi) => (
                        <div key={mat.id} className="material-card">
                          <input placeholder="Nombre del archivo" value={mat.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.titulo`, e.target.value)} />
                          <button type="button" onClick={() => removeMaterial(ni, li, mi)}>❌</button>
                        </div>
                      ))}
                    </div>
                  ))}
                  <button type="button" className="btn-add-section" onClick={() => addLeccion(ni)}><Plus size={16}/> Añadir Lección</button>

                  <div className="section-title"><HelpCircle size={16}/> Examen del Nivel</div>
                  {nivel.preguntas.map((preg, pi) => (
                    <div key={preg.id} className="pregunta-editor-card">
                      <input className="input-q" placeholder="Escribe la pregunta..." value={preg.pregunta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)} />
                      <div className="opciones-grid">
                        {preg.opciones.map((opt, oi) => (
                          <input key={oi} placeholder={`Opción ${oi + 1}`} value={opt} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)} />
                        ))}
                      </div>
                      <select value={preg.correcta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}>
                        {preg.opciones.map((_, oi) => <option key={oi} value={oi}>Opción {oi + 1} es la correcta</option>)}
                      </select>
                    </div>
                  ))}
                  <button type="button" className="btn-add-section" onClick={() => addPregunta(ni)}><Plus size={16}/> Añadir Pregunta</button>
                </div>
              </section>
            ))}
            <button type="button" className="btn-add-nivel-master" onClick={addNivel}><Plus /> Nuevo Nivel</button>
          </main>
        </form>
      </div>
    </div>
  );
}