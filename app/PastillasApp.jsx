import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pill, ShoppingBag, Bell, FileText, Home, GraduationCap, Stethoscope, Trash2, ChevronRight, Shield, Info, AlertTriangle, BookOpen, Clock, FlaskRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import MEDICINAS from "./medicinas.json";


import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";



/**
 * Pastillas.app — Prototipo interactivo (enfocado a México)
 * Notas:
 * - Este es un prototipo sólo con fines informativos y educativos.
 * - No sustituye la consulta médica. Para dudas, acude a tu profesional de salud.
 * - Datos guardados localmente en tu navegador (localStorage). No subimos nada a servidores.
 */

// ===== Utilidades =====
const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`);
const classNames = (...arr) => arr.filter(Boolean).join(" ");

function useLocalState(key, initial) {
    const [state, setState] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify(state)); } catch { }
    }, [key, state]);
    return [state, setState];
}

// ===== Claves de almacenamiento local =====
const LS_KEYS = {
    recetas: "pastillas_recetas",
    alarmas: "pastillas_alarmas",
    estudios: "pastillas_estudios"
};

// ===== Enlaces de tiendas MX =====
const STORES = [
    { name: "Farmacia San Pablo", buildUrl: (q) => `https://www.farmaciasanpablo.com.mx/buscar?q=${encodeURIComponent(q)}` },
    { name: "Farmacias del Ahorro", buildUrl: (q) => `https://www.fahorro.com/catalogsearch/result/?q=${encodeURIComponent(q)}` },
    { name: "Farmacias Guadalajara", buildUrl: (q) => `https://www.farmaciasguadalajara.com.mx/buscar?q=${encodeURIComponent(q)}` },
    { name: "Benavides", buildUrl: (q) => `https://www.benavides.com.mx/search?q=${encodeURIComponent(q)}` },
];

// ===== Buscadores de papers / regulatorio =====
const PAPER_LINKS = {
    pubmed: (q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,
    cochrane: (q) => `https://www.cochranelibrary.com/search?searchPhrase=${encodeURIComponent(q)}`,
    cofepris: () => `https://www.gob.mx/cofepris/acciones-y-programas/consulta-de-registros-sanitarios`,
};



// ===== Secciones UI reutilizables =====
const Section = ({ icon: Icon, title, subtitle, children, action }) => (
    <Card className="w-full border shadow-sm">
        <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50">
                        <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{title}</h2>
                        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                </div>
                {action}
            </div>
            <div className="mt-6">{children}</div>
        </CardContent>
    </Card>
);
function Inicio({ go }) {
    const cards = [
        {
            id: "medicinas",
            title: "Explora medicamentos",
            desc: "Ficha técnica, efectos secundarios y dónde comprarlos.",
            icon: Pill,
        },
        {
            id: "alarmas",
            title: "Alarmas de toma",
            desc: "Configura recordatorios para no olvidar tus dosis.",
            icon: Bell,
        },
        {
            id: "recetas",
            title: "Guarda tus recetas médicas",
            desc: "Sube tus recetas en PDF/imagen y consérvalas como historial.",
            icon: FileText,
        },
        {
            id: "interacciones",
            title: "Checa interacciones",
            desc: "Verifica interacciones básicas entre los fármacos de tu lista.",
            icon: Stethoscope,
        },
        {

            title: "Educación",
            desc: "Artículos y buscadores (PubMed, Cochrane) por medicamento.",
            icon: GraduationCap,
            id: "educacion",
        },
        {
            title: "Estudios",
            desc: "Info de estudios de sangre y guarda tus PDFs/imágenes en historial.",
            icon: FlaskRound,
            id: "estudios",
        },
    ];

    return (
        <Section
            icon={Home}
            title="Bienvenido a pastillas.app"
            subtitle="Información y herramientas sobre medicamentos en México (prototipo)."
        >
            {/* tarjetas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map(({ id, title, desc, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => go?.(id)}
                        className="p-4 rounded-2xl border text-left hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <Icon className="w-6 h-6 mb-2" />
                        <div className="font-medium">{title}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                    </button>
                ))}
            </div>

            {/* aviso */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm leading-relaxed">
                    <strong>Descargo de responsabilidad:</strong> Esta plataforma tiene fines
                    informativos y no sustituye la consulta médica. Sigue siempre las indicaciones
                    de tu profesional de salud. Algunos medicamentos requieren receta (<em>receta
                        médica</em>) para su venta y entrega en México.
                </p>
            </div>
        </Section>
    );
}

// ====== Componentes de secciones ======
// Normaliza texto: minúsculas + quita acentos
const norm = (s) =>
    (s ?? "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
function Medicinas() {
    const [query, setQuery] = useState("");
    const [seleccion, setSeleccion] = useState(MEDICINAS[0].id);

    const meds = useMemo(() => {
        const q = query.toLowerCase();
        return MEDICINAS.filter(m =>
            m.nombre.toLowerCase().includes(q) ||
            m.principioActivo.toLowerCase().includes(q) ||
            m.indicaciones.join(" ").toLowerCase().includes(q) ||
            (m.marcas || []).some(x => x.toLowerCase().includes(q))
        );
    }, [query]);

    const activo = meds.find(m => m.id === seleccion) || meds[0];

    return (
        <Section icon={Pill} title="Medicamentos" subtitle="Consulta fichas, efectos, advertencias e investigación relacionada.">
            <div className="mb-6 relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por nombre, principio activo o marca"
                    className="pl-9"
                />
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-2 max-h-[520px] overflow-auto pr-1">
                    {meds.map((m) => (
                        <button key={m.id} onClick={() => setSeleccion(m.id)} className={classNames("w-full text-left p-3 rounded-xl border hover:bg-muted transition flex items-center justify-between", m.id === seleccion ? "border-indigo-500 bg-indigo-50" : "")}>
                            <div>
                                <div className="font-medium">{m.nombre}</div>
                                <div className="text-xs text-muted-foreground">{m.principioActivo}</div>
                            </div>
                            <Badge variant={m.categoria.includes("Rx") ? "destructive" : "secondary"}>{m.categoria}</Badge>
                        </button>
                    ))}
                    {meds.length === 0 && <div className="text-sm text-muted-foreground">No hay resultados para esa búsqueda.</div>}
                </div>

                {activo && (
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-4 border rounded-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">{activo.nombre}</h3>
                                    <p className="text-sm text-muted-foreground">{activo.principioActivo}</p>
                                    {activo.marcas && activo.marcas.length > 0 && (
                                        <div className="mt-2 text-sm">
                                            <Label>Marcas comunes</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {activo.marcas.map((m, idx) => (
                                                    <Badge key={idx} variant="outline">{m}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Badge variant={activo.categoria.includes("Rx") ? "destructive" : "secondary"}>{activo.categoria}</Badge>
                            </div>
                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Indicaciones</Label>
                                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                                        {activo.indicaciones.map((i, idx) => <li key={idx}>{i}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <Label>Presentaciones comunes</Label>
                                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                                        {activo.presentaciones.map((p, idx) => <li key={idx}><span className="font-medium">{p.forma}</span>: {p.dosis} <span className="text-muted-foreground">— {p.notas}</span></li>)}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Advertencias</Label>
                                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                                        {activo.advertencias.map((a, idx) => <li key={idx}>{a}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <Label>Efectos secundarios </Label>
                                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                                        {activo.efectosSecundarios.map((e, idx) => <li key={idx}>{e}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Label>Interacciones</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {activo.interacciones.map((x, idx) => <Badge key={idx} variant="outline">{x}</Badge>)}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">¿Dónde comprar?</h4>
                                    <p className="text-sm text-muted-foreground">Enlaces a búsquedas en farmacias populares (podrían cambiar).</p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {activo.comprarEn.map((c, idx) => (
                                    <Button key={idx} variant="secondary" onClick={() => openStore(c.tienda, activo)} className="gap-2"> <ShoppingBag className="w-4 h-4" /> {c.tienda}</Button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border rounded-2xl">
                            <h4 className="font-semibold">Investigación y regulatorio</h4>
                            <p className="text-sm text-muted-foreground">Enlaces a buscadores de literatura biomédica y consulta regulatoria.</p>
                            <div className="mt-3 grid md:grid-cols-2 gap-3">
                                {activo.papers.map((p, idx) => (
                                    <a key={idx} href={p.url} target="_blank" className="p-3 rounded-xl border hover:bg-muted transition block">
                                        <div className="text-sm font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" />{p.titulo}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Fuente: {p.fuente}</div>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">Nota: los resultados dependen de cada sitio externo.</div>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
}

function Recetas() {
    // ===== helpers =====
    const asStr = (v) => (v ?? "");
    const asNum = (v, fb = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fb;
    };
    const weekCodes = ["lu", "ma", "mi", "ju", "vi", "sa", "do"];
    const weekLabels = { lu: "Lun", ma: "Mar", mi: "Mié", ju: "Jue", vi: "Vie", sa: "Sáb", do: "Dom" };

    // ===== stores =====
    const [recetas, setRecetas] = useLocalState(LS_KEYS.recetas, []);
    const [alarmas, setAlarmas] = useLocalState(LS_KEYS.alarmas, []);

    // archivo | manual
    const [modo, setModo] = React.useState("archivo");

    // ===== form meta =====
    const [meta, setMeta] = React.useState({
        medico: "",
        clinica: "",
        fecha: "",
        vigencia: "",
        medicamentos: [],
    });

    // contador visible de medicamentos
    const [medsCount, setMedsCount] = React.useState(0);

    // ===== subir archivo =====
    const onUpload = (f) => {
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            const item = {
                id: uuid(),
                tipo: "archivo",
                fecha: new Date().toISOString(),
                medico: asStr(meta.medico),
                clinica: asStr(meta.clinica),
                vigencia: asStr(meta.vigencia),
                dataUrl: reader.result,
                nombre: f.name || "receta",
            };
            setRecetas([item, ...recetas]);
            toast.success("Receta (archivo) guardada");
        };
        reader.readAsDataURL(f);
    };

    // ===== guardar manual =====
    const saveManual = () => {
        if (!asStr(meta.fecha)) return toast.error("La fecha es obligatoria");

        const meds = (meta.medicamentos || []).filter((m) => asStr(m.nombre).trim());
        if (meds.length === 0) return toast.error("Agrega al menos un medicamento");

        const normalizaMed = (m) => ({
            nombre: asStr(m.nombre),
            dosis: asStr(m.dosis),
            regimen: m.regimen || "diario", // diario | semanal | mensual
            veces: Math.max(1, Math.min(6, asNum(m.veces, 1))), // solo aplica a diario
            diasSemana:
                m.diasSemana ||
                { lu: true, ma: true, mi: true, ju: true, vi: true, sa: true, do: true }, // DEFAULT: TODOS LOS DÍAS
            diaSemanal: m.diaSemanal || "lu",
            diaMes: Math.min(31, Math.max(1, asNum(m.diaMes, 1))),
            activarAlarma: !!m.activarAlarma,
        });

        const item = {
            id: uuid(),
            tipo: "manual",
            fecha: meta.fecha, // YYYY-MM-DD
            medico: asStr(meta.medico),
            clinica: asStr(meta.clinica),
            vigencia: asStr(meta.vigencia),
            medicamentos: meds.map(normalizaMed),
        };

        // Auto-alarmas: diario y semanal
        const slots = ["08:00", "12:00", "18:00", "22:00", "06:00", "14:00"];
        const crearAlarmas = item.medicamentos
            .filter((m) => m.activarAlarma)
            .flatMap((m) => {
                if (m.regimen === "diario") {
                    return [
                        {
                            id: uuid(),
                            medicamento: m.nombre,
                            dosis: m.dosis,
                            titulo: "Según receta",
                            horas: Array.from({ length: m.veces }, (_, i) => slots[i] || "08:00"),
                            dias: m.diasSemana, // respeta selección
                            activar: true,
                            creada: new Date().toISOString(),
                            vigenciaDias: 0,
                        },
                    ];
                }
                if (m.regimen === "semanal") {
                    const dias = Object.fromEntries(weekCodes.map((k) => [k, k === m.diaSemanal]));
                    return [
                        {
                            id: uuid(),
                            medicamento: m.nombre,
                            dosis: m.dosis,
                            titulo: "Según receta (semanal)",
                            horas: [slots[0]], // 1 vez
                            dias,
                            activar: true,
                            creada: new Date().toISOString(),
                            vigenciaDias: 0,
                        },
                    ];
                }
                // mensual -> sin auto-alarma (motor actual por días de semana)
                toast.info(`"${m.nombre}": mensual. Crea la alarma manualmente en la sección Alarmas.`);
                return [];
            });

        if (crearAlarmas.length) {
            setAlarmas([...crearAlarmas, ...alarmas]);
            toast.success(`Se crearon ${crearAlarmas.length} alarma(s)`);
        }

        setRecetas([item, ...recetas]);
        toast.success("Receta (manual) guardada");

        // reset
        setMeta({ medico: "", clinica: "", fecha: "", vigencia: "", medicamentos: [] });
        setMedsCount(0);
    };

    // ===== eliminar receta =====
    const del = (id) => setRecetas(recetas.filter((r) => r.id !== id));

    // ===== badge de vigencia =====
    const MS_DIA = 24 * 60 * 60 * 1000;
    const diasRestantesReceta = (r) => {
        const n = parseInt(String(r.vigencia || "").trim(), 10);
        if (isNaN(n) || !r.fecha) return null;
        const inicio = new Date(r.fecha);
        const fin = new Date(inicio.getTime() + n * MS_DIA);
        return Math.ceil((fin.getTime() - Date.now()) / MS_DIA);
    };

    // helpers UI
    const setMedField = (idx, patch) => {
        const arr = [...meta.medicamentos];
        arr[idx] = { ...arr[idx], ...patch };
        setMeta({ ...meta, medicamentos: arr });
    };

    const toggleDia = (m, idx, code) => {
        const arr = [...meta.medicamentos];
        const next = { ...(m.diasSemana || {}) };
        next[code] = !next[code];
        arr[idx] = { ...m, diasSemana: next };
        setMeta({ ...meta, medicamentos: arr });
    };

    // ===== render =====
    return (
        <Section
            icon={FileText}
            title="Recetas médicas"
            subtitle="Sube y conserva tus recetas como historial (local en tu navegador)."
        >
            <div className="grid md:grid-cols-3 gap-6">
                {/* ===== Columna izquierda (form) ===== */}
                <div className="md:col-span-1 p-4 rounded-2xl border space-y-4">
                    {/* modo */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={modo === "archivo" ? "default" : "outline"}
                            onClick={() => setModo("archivo")}
                        >
                            Subir archivo
                        </Button>
                        <Button
                            type="button"
                            variant={modo === "manual" ? "default" : "outline"}
                            onClick={() => setModo("manual")}
                        >
                            Captura manual
                        </Button>
                    </div>

                    {/* campos comunes */}
                    <div className="grid gap-3">
                        <div>
                            <Label>Médico</Label>
                            <Input
                                value={asStr(meta.medico)}
                                onChange={(e) => setMeta({ ...meta, medico: e.target.value })}
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <Label>Clínica / Hospital</Label>
                            <Input
                                value={asStr(meta.clinica)}
                                onChange={(e) => setMeta({ ...meta, clinica: e.target.value })}
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <Label>Fecha</Label>
                            <Input
                                type="date"
                                value={asStr(meta.fecha)}
                                onChange={(e) => setMeta({ ...meta, fecha: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Vigencia (si aplica)</Label>
                            <Input
                                value={asStr(meta.vigencia)}
                                onChange={(e) => setMeta({ ...meta, vigencia: e.target.value })}
                                placeholder="Ej. 30 días"
                            />
                        </div>
                    </div>

                    {/* subir archivo */}
                    {modo === "archivo" && (
                        <div className="space-y-2">
                            <div>
                                <Label>Subir receta (PDF/Imagen)</Label>
                                <Input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => onUpload(e.target.files?.[0])}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Formatos aceptados: imagen o PDF.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* captura manual */}
                    {modo === "manual" && (
                        <div className="space-y-3">
                            <div>
                                <Label>Medicamentos (máx. 10)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={medsCount}
                                    onChange={(e) => {
                                        const n = Math.min(10, Math.max(1, asNum(e.target.value, 1)));
                                        setMedsCount(n);
                                        setMeta((s) => ({
                                            ...s,
                                            medicamentos: Array.from({ length: n }, (_, i) =>
                                                s.medicamentos[i] || {
                                                    nombre: "",
                                                    dosis: "",
                                                    regimen: "diario", // default
                                                    veces: 1,
                                                    // DEFAULT: TODOS LOS DÍAS ACTIVOS
                                                    diasSemana: { lu: true, ma: true, mi: true, ju: true, vi: true, sa: true, do: true },
                                                    diaSemanal: "lu",
                                                    diaMes: 1,
                                                    activarAlarma: false,
                                                }
                                            ),
                                        }));
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                {meta.medicamentos.map((m, idx) => (
                                    <div key={idx} className="p-3 border rounded-xl grid gap-2">
                                        <div className="text-xs text-muted-foreground">Medicamento #{idx + 1}</div>

                                        <Input
                                            placeholder="Nombre"
                                            value={asStr(m.nombre)}
                                            onChange={(e) => setMedField(idx, { nombre: e.target.value ?? "" })}
                                        />
                                        <Input
                                            placeholder="Dosis (ej. 500 mg)"
                                            value={asStr(m.dosis)}
                                            onChange={(e) => setMedField(idx, { dosis: e.target.value ?? "" })}
                                        />

                                        {/* RÉGIMEN */}
                                        <div className="grid sm:grid-cols-3 gap-2 items-end">
                                            <div>
                                                <Label className="text-xs">Régimen</Label>
                                                <select
                                                    className="w-full border rounded-md h-9 px-2 text-sm"
                                                    value={m.regimen || "diario"}
                                                    onChange={(e) => setMedField(idx, { regimen: e.target.value })}
                                                >
                                                    <option value="diario">Diario</option>
                                                    <option value="semanal">Semanal</option>
                                                    <option value="mensual">Mensual</option>
                                                </select>
                                            </div>

                                            {/* Veces por día (solo diario) */}
                                            {m.regimen === "diario" && (
                                                <div>
                                                    <Label className="text-xs">Veces por día</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={6}
                                                        value={asNum(m.veces, 1)}
                                                        onChange={(e) =>
                                                            setMedField(idx, {
                                                                veces: Math.max(1, Math.min(6, asNum(e.target.value, 1))),
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={!!m.activarAlarma}
                                                    onCheckedChange={(v) => setMedField(idx, { activarAlarma: !!v })}
                                                />
                                                <span className="text-sm">Auto-alarma</span>
                                            </div>
                                        </div>

                                        {/* Config específica por régimen */}
                                        {m.regimen === "diario" && (
                                            <div className="grid gap-2">
                                                <Label className="text-xs">Días de la semana</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {weekCodes.map((code) => (
                                                        <button
                                                            key={code}
                                                            type="button"
                                                            onClick={() => toggleDia(m, idx, code)}
                                                            className={classNames(
                                                                "px-2 py-1 rounded-md border text-xs",
                                                                m?.diasSemana?.[code] ? "bg-indigo-50 border-indigo-400" : ""
                                                            )}
                                                        >
                                                            {weekLabels[code]}
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 rounded-md border text-xs"
                                                        onClick={() =>
                                                            setMedField(idx, {
                                                                diasSemana: { lu: true, ma: true, mi: true, ju: true, vi: true, sa: true, do: true },
                                                            })
                                                        }
                                                    >
                                                        Todos
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 rounded-md border text-xs"
                                                        onClick={() =>
                                                            setMedField(idx, {
                                                                diasSemana: { lu: true, ma: true, mi: true, ju: true, vi: true, sa: false, do: false },
                                                            })
                                                        }
                                                    >
                                                        Lu–Vi
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {m.regimen === "semanal" && (
                                            <div className="grid sm:grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs">Día de la semana</Label>
                                                    <select
                                                        className="w-full border rounded-md h-9 px-2 text-sm"
                                                        value={m.diaSemanal || "lu"}
                                                        onChange={(e) => setMedField(idx, { diaSemanal: e.target.value })}
                                                    >
                                                        {weekCodes.map((c) => (
                                                            <option key={c} value={c}>
                                                                {weekLabels[c]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <p className="text-xs text-muted-foreground self-end">
                                                    Se auto-creará una alarma semanal (1×) si activas “Auto-alarma”.
                                                </p>
                                            </div>
                                        )}

                                        {m.regimen === "mensual" && (
                                            <div className="grid sm:grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs">Día del mes</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={31}
                                                        value={asNum(m.diaMes, 1)}
                                                        onChange={(e) =>
                                                            setMedField(idx, {
                                                                diaMes: Math.min(31, Math.max(1, asNum(e.target.value, 1))),
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground self-end">
                                                    Nota: las auto-alarmas mensuales aún no están soportadas. Crea la alarma manualmente.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={saveManual}>Guardar receta manual</Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setMeta({ medico: "", clinica: "", fecha: "", vigencia: "", medicamentos: [] });
                                        setMedsCount(0);
                                    }}
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== Columna derecha (historial) ===== */}
                <div className="md:col-span-2">
                    {recetas.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No has agregado recetas aún.</div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {recetas.map((r) => (
                                <div key={r.id} className="p-3 rounded-xl border">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> {r.nombre || "Receta"}
                                                {(() => {
                                                    const left = diasRestantesReceta(r);
                                                    if (left === null) return null;
                                                    if (left <= 0) return <Badge variant="destructive">Vencida</Badge>;
                                                    return (
                                                        <Badge variant="secondary">
                                                            {left} día{left === 1 ? "" : "s"} restantes
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(r.fecha).toLocaleString()}
                                            </div>
                                            {r.medico && <div className="text-xs mt-1">Dr(a). {r.medico}</div>}
                                            {r.clinica && <div className="text-xs">Clínica: {r.clinica}</div>}
                                            {r.vigencia && <div className="text-xs">Vigencia: {r.vigencia}</div>}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {r.dataUrl && (
                                                <a className="text-sm underline" href={r.dataUrl} download={r.nombre || "receta"}>
                                                    Descargar
                                                </a>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="ghost" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar esta receta médica?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Se eliminará de tu historial y no podrás deshacer esta acción.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => del(r.id)}>Sí, eliminar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* resumen de meds (si es manual) */}
                                    {r.tipo === "manual" && Array.isArray(r.medicamentos) && r.medicamentos.length > 0 && (
                                        <div className="mt-2 border-t pt-2 space-y-1">
                                            {r.medicamentos.map((m, i) => (
                                                <div key={i} className="text-xs">
                                                    <span className="font-medium">{m.nombre}</span>
                                                    {m.dosis ? ` — ${m.dosis}` : ""} ·{" "}
                                                    {m.regimen === "diario" && "Diario"}
                                                    {m.regimen === "semanal" && `Semanal (${weekLabels[m.diaSemanal || "lu"]})`}
                                                    {m.regimen === "mensual" && `Mensual (día ${m.diaMes})`}
                                                    {m.regimen === "diario" && m.veces ? ` · ${m.veces}×` : ""}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
}





function Estudios() {
    const [estudios, setEstudios] = useLocalState(LS_KEYS.estudios, []);
    const [meta, setMeta] = useState({ tipo: "", laboratorio: "", fecha: "" });

    const onUpload = (f) => {
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            const item = {
                id: uuid(),
                fechaSubida: new Date().toISOString(),
                tipo: meta.tipo || "Estudio",
                laboratorio: meta.laboratorio || "",
                fecha: meta.fecha || "",
                dataUrl: reader.result,
                nombre: f.name,
                size: f.size,
            };
            setEstudios([item, ...estudios]);
            toast.success("Estudio guardado localmente");
        };
        reader.readAsDataURL(f);
    };

    const del = (id) => setEstudios(estudios.filter((e) => e.id !== id));

    const INFO = [
        {
            titulo: "Biometría hemática (BH)",
            detalle:
                "Evalúa glóbulos rojos (Hb, Hto), blancos y plaquetas. Útil en anemia, infecciones, sangrado.",
        },
        {
            titulo: "Química sanguínea",
            detalle:
                "Glucosa, urea, creatinina, electrolitos, enzimas. Da panorama metabólico/renal.",
        },
        {
            titulo: "Perfil de lípidos",
            detalle:
                "Colesterol total, LDL, HDL y triglicéridos. Riesgo cardiovascular.",
        },
        {
            titulo: "HbA1c",
            detalle:
                "Promedio de glucosa ~3 meses. Seguimiento de diabetes.",
        },
        {
            titulo: "TSH / T4 libre",
            detalle:
                "Función tiroidea. Útil en hipo/hipertiroidismo.",
        },
        {
            titulo: "Pruebas hepáticas",
            detalle:
                "ALT, AST, FA, BT. Evaluación de hígado.",
        },
        {
            titulo: "PCR / VSG",
            detalle:
                "Marcadores de inflamación sistémica.",
        },
        {
            titulo: "Ferritina / Hierro",
            detalle:
                "Depósitos de hierro. Apoya diagnóstico de anemia ferropénica.",
        },
    ];

    return (
        <Section
            icon={FlaskRound}
            title="Estudios de laboratorio"
            subtitle="Información general de estudios sanguíneos y tu historial de archivos (local)."
        >
            <div className="grid md:grid-cols-3 gap-6">
                {/* Panel informativo */}
                <div className="md:col-span-2 p-4 rounded-2xl border space-y-3">
                    <h3 className="font-semibold">Estudios comunes</h3>
                    <div className="space-y-2">
                        {INFO.map((x, i) => (
                            <div key={i} className="p-3 rounded-xl border">
                                <div className="font-medium">{x.titulo}</div>
                                <div className="text-sm text-muted-foreground">{x.detalle}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Esta información es general y no sustituye la interpretación de un profesional
                        de la salud. Para resultados específicos, consulta con tu médico.
                    </p>
                </div>

                {/* Cargador / formulario */}
                <div className="md:col-span-1 p-4 rounded-2xl border space-y-3">
                    <div>
                        <Label>Tipo de estudio</Label>
                        <Input
                            value={meta.tipo}
                            onChange={(e) => setMeta({ ...meta, tipo: e.target.value })}
                            placeholder="Ej. Biometría hemática"
                        />
                    </div>
                    <div>
                        <Label>Laboratorio</Label>
                        <Input
                            value={meta.laboratorio}
                            onChange={(e) => setMeta({ ...meta, laboratorio: e.target.value })}
                            placeholder="Opcional (Ej. Laboratorio ABC)"
                        />
                    </div>
                    <div>
                        <Label>Fecha del estudio</Label>
                        <Input
                            type="date"
                            value={meta.fecha}
                            onChange={(e) => setMeta({ ...meta, fecha: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Subir archivo</Label>
                        <Input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => onUpload(e.target.files?.[0])}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Acepta imágenes o PDF. Se guardan localmente en tu navegador.
                        </p>
                    </div>
                </div>
            </div>

            {/* Historial */}
            <div className="mt-8">
                <h4 className="font-semibold mb-2">Historial de estudios</h4>
                {estudios.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Aún no has cargado estudios.</div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                        {estudios.map((e) => (
                            <div key={e.id} className="p-3 rounded-xl border">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {e.tipo} — {e.nombre}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {e.fecha ? `Fecha del estudio: ${e.fecha} · ` : ""}
                                            Subido: {new Date(e.fechaSubida).toLocaleString()}
                                            {e.laboratorio ? ` · ${e.laboratorio}` : ""}
                                        </div>
                                        {e.size ? (
                                            <div className="text-[11px] text-muted-foreground mt-1">
                                                Tamaño aprox.: {(e.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a className="text-sm underline" href={e.dataUrl} download={e.nombre}>
                                            Descargar
                                        </a>
                                        <Button size="icon" variant="ghost" onClick={() => del(e.id)} title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Section>
    );
}

function Alarmas() {
    const [alarmas, setAlarmas] = useLocalState(LS_KEYS.alarmas, []);
    const defaultTimes = ["08:00", "12:00", "18:00", "22:00"];

    // ---- helpers de vigencia ----
    const MS_DIA = 24 * 60 * 60 * 1000;
    const diasRestantes = (a) => {
        if (!a?.vigenciaDias || !a?.creada) return null; // sin vigencia
        const fin = new Date(new Date(a.creada).getTime() + a.vigenciaDias * MS_DIA);
        const hoy = new Date();
        return Math.ceil((fin - hoy) / MS_DIA);
    };

    // ---- estado del formulario (única vez) ----
    const [form, setForm] = useState({
        medicamento: "",
        dosis: "",
        titulo: "",
        veces: 1,                 // cuántas veces al día
        horas: ["08:00"],         // arreglo de horas (length = veces)
        dias: { lu: true, ma: true, mi: true, ju: true, vi: true, sa: false, do: false },
        activar: true,
        vigenciaDias: "",         // vacío o 0 => sin vigencia
    });

    // ---- setters auxiliares ----
    const setHora = (idx, value) => {
        const horas = [...form.horas];
        horas[idx] = value;
        setForm({ ...form, horas });
    };

    const setVeces = (n) => {
        const veces = Math.max(1, Math.min(6, Number(n) || 1));
        const horas = Array.from({ length: veces }, (_, i) => form.horas[i] || defaultTimes[i] || "08:00");
        setForm({ ...form, veces, horas });
    };

    // ---- al montar: si alguna alarma ya está vencida, desactívala ----
    useEffect(() => {
        const next = alarmas.map(a => {
            const left = diasRestantes(a);
            if (left !== null && left <= 0 && a.activar) {
                return { ...a, activar: false };
            }
            return a;
        });
        if (JSON.stringify(next) !== JSON.stringify(alarmas)) setAlarmas(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- timer de notificaciones ----
    useEffect(() => {
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            try { Notification.requestPermission(); } catch { }
        }

        const timer = setInterval(() => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            const hhmm = `${hh}:${mm}`;
            const dia = ["do", "lu", "ma", "mi", "ju", "vi", "sa"][now.getDay()];

            alarmas.forEach(a => {
                if (!a.activar) return;

                // saltar si vencida
                const left = diasRestantes(a);
                if (left !== null && left <= 0) return;

                // día activo
                if (!a.dias?.[dia]) return;

                // hora coincide
                const match = Array.isArray(a.horas) ? a.horas.includes(hhmm) : (a.hora ? a.hora === hhmm : false);
                if (!match) return;

                const etiquetaMed = a.medicamento || "tu medicamento";
                const etiquetaDosis = a.dosis ? ` ${a.dosis}` : "";
                const msg = `${a.titulo || "Hora de tomar"} — ${etiquetaMed}${etiquetaDosis}`;
                try {
                    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                        new Notification(msg);
                    }
                } catch { }
                toast(msg);
            });
        }, 1000 * 30);

        return () => clearInterval(timer);
    }, [alarmas]);

    // ---- alta de alarma ----
    const canSubmit = () => {
        if (!form.medicamento.trim()) return false;
        if (!form.horas || form.horas.length === 0) return false;
        if (!form.horas.every(Boolean)) return false;
        return true;
    };

    const add = () => {
        if (!canSubmit()) return toast.error("Completa medicamento y horarios");

        const nuevo = {
            id: uuid(),
            medicamento: form.medicamento.trim(),
            dosis: form.dosis.trim(),
            titulo: form.titulo.trim(),
            horas: form.horas.slice(0, form.veces),
            dias: form.dias,
            activar: form.activar,
            creada: new Date().toISOString(),
            vigenciaDias: Number(form.vigenciaDias) || 0,
        };

        setAlarmas([nuevo, ...alarmas]);
        toast.success("Alarma creada");

        setForm({
            medicamento: "",
            dosis: "",
            titulo: "",
            veces: 1,
            horas: ["08:00"],
            dias: form.dias,
            activar: true,
            vigenciaDias: "",
        });
    };

    // ---- acciones por alarma ----
    const toggle = (id) => setAlarmas(alarmas.map(a => a.id === id ? { ...a, activar: !a.activar } : a));
    const del = (id) => setAlarmas(alarmas.filter(a => a.id !== id));

    const DayToggle = ({ code, label }) => (
        <label
            className={classNames("px-2 py-1 rounded-md border text-xs cursor-pointer", form.dias[code] ? "bg-indigo-50 border-indigo-400" : "")}
            onClick={() => setForm({ ...form, dias: { ...form.dias, [code]: !form.dias[code] } })}
        >
            {label}
        </label>
    );

    return (
        <Section icon={Bell} title="Alarmas de medicación" subtitle="Recibe recordatorios locales en horarios definidos (requiere permisos de notificación).">
            <div className="grid md:grid-cols-3 gap-6">
                {/* Panel izquierdo: formulario */}
                <div className="md:col-span-1 p-4 rounded-2xl border space-y-3">
                    <div>
                        {/* Medicamento y dosis */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <Label>Medicamento</Label>
                                <Input
                                    value={form.medicamento}
                                    onChange={(e) => setForm({ ...form, medicamento: e.target.value })}
                                    placeholder="Ej. Paracetamol"
                                />
                            </div>
                            <div>
                                <Label>Dosis</Label>
                                <Input
                                    value={form.dosis}
                                    onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                                    placeholder="Ej. 500 mg"
                                />
                            </div>
                        </div>

                        {/* Título (opcional) */}
                        <div className="mt-3">
                            <Label>Título</Label>
                            <Input
                                value={form.titulo}
                                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                placeholder="Ej. Desayuno"
                            />
                        </div>

                        {/* Veces al día + horarios */}
                        <div className="mt-3 grid sm:grid-cols-[1fr,2fr] gap-3 items-end">
                            <div>
                                <Label>Veces al día</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={form.veces}
                                    onChange={(e) => setVeces(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Entre 1 y 6 veces.</p>
                            </div>

                            <div>
                                <Label>Horarios</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                    {Array.from({ length: form.veces }).map((_, i) => (
                                        <Input
                                            key={i}
                                            type="time"
                                            value={form.horas[i] || ""}
                                            onChange={(e) => setHora(i, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vigencia */}
                        <div className="mt-3 grid sm:grid-cols-2 gap-3">
                            <div>
                                <Label>Vigencia (días)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0 = sin vigencia"
                                    value={form.vigenciaDias}
                                    onChange={(e) => setForm({ ...form, vigenciaDias: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Deja 0 o vacío para sin vigencia.</p>
                            </div>
                        </div>
                    </div>

                    {/* Días */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        <DayToggle code="lu" label="Lu" />
                        <DayToggle code="ma" label="Ma" />
                        <DayToggle code="mi" label="Mi" />
                        <DayToggle code="ju" label="Ju" />
                        <DayToggle code="vi" label="Vi" />
                        <DayToggle code="sa" label="Sa" />
                        <DayToggle code="do" label="Do" />
                    </div>

                    {/* Activar + guardar */}
                    <div className="flex items-center gap-2 mt-2">
                        <Switch checked={form.activar} onCheckedChange={(v) => setForm({ ...form, activar: v })} />
                        <span className="text-sm">Activar al guardar</span>
                    </div>
                    <Button className="w-full mt-2" onClick={add}>
                        <Clock className="w-4 h-4 mr-1" /> Guardar alarma
                    </Button>
                    <div className="text-xs text-muted-foreground">Las alarmas funcionan mientras esta pestaña esté abierta.</div>
                </div>

                {/* Panel derecho: listado */}
                <div className="md:col-span-2">
                    {alarmas.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Aún no has creado alarmas.</div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {alarmas.map((a) => (
                                <div key={a.id} className="p-3 border rounded-xl flex items-start justify-between gap-3">
                                    <div>
                                        {/* Título */}
                                        <div className="font-medium">{a.titulo || "Sin título"}</div>

                                        {/* Badge vigencia */}
                                        {(() => {
                                            const left = diasRestantes(a);
                                            if (left === null) return null; // sin vigencia
                                            const label = left <= 0 ? "Vencida" : `${left} día${left === 1 ? "" : "s"} restantes`;
                                            const variant =
                                                left <= 0 ? "destructive" :
                                                    left <= 3 ? "secondary" :
                                                        "outline";
                                            return <Badge variant={variant} className="mt-1">{label}</Badge>;
                                        })()}

                                        {/* horarios + días */}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {(Array.isArray(a.horas) ? a.horas.join(" · ") : a.hora) + " · " +
                                                Object.entries(a.dias).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(" ")
                                            }
                                        </div>

                                        {/* medicamento + dosis */}
                                        <div className="text-xs">
                                            {a.medicamento}{a.dosis ? ` — ${a.dosis}` : ""}
                                        </div>
                                    </div>

                                    {/* acciones */}
                                    <div className="flex items-center gap-2">
                                        <Switch checked={a.activar} onCheckedChange={() => toggle(a.id)} />
                                        <Button size="icon" variant="ghost" onClick={() => del(a.id)} title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
}


function Educacion() {
    return (
        <Section icon={GraduationCap} title="Aprende más" subtitle="Artículos y recursos externos por medicamento (buscadores biomédicos y regulatorio).">
            <div className="grid md:grid-cols-2 gap-4">
                {MEDICINAS.map(m => (
                    <div key={m.id} className="p-4 rounded-2xl border">
                        <div className="font-semibold">{m.nombre}</div>
                        <div className="text-sm text-muted-foreground">{m.principioActivo}</div>
                        <div className="mt-2 grid gap-2">
                            {m.papers.map((p, idx) => (
                                <a key={idx} href={p.url} target="_blank" className="text-sm underline inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> {p.titulo} <ChevronRight className="w-4 h-4" /></a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

function Interacciones() {
    const [entrada, setEntrada] = useState("");
    const [res, setRes] = useState([]);
    const check = () => {
        const tokens = entrada.toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        const hallazgos = [];
        MEDICINAS.forEach(m => {
            if (tokens.includes(m.nombre.toLowerCase()) || tokens.includes(m.principioActivo.toLowerCase().split(" ")[0])) {
                m.interacciones.forEach(i => hallazgos.push({ med: m.nombre, riesgo: i }));
            }
        });
        setRes(hallazgos);
        if (hallazgos.length === 0) toast("No se hallaron interacciones en este catálogo (parcial)");
    };
    return (
        <Section icon={Stethoscope} title="Interacciones (demo)" subtitle="Herramienta demostrativa basada en este catálogo (no sustituye bases clínicas profesionales).">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4 rounded-2xl border">
                    <Label>Ingresa medicamentos (uno por línea o separados por coma)</Label>
                    <Textarea rows={8} value={entrada} onChange={e => setEntrada(e.target.value)} placeholder={`Ej.\nParacetamol\nIbuprofeno\nWarfarina`} />
                    <Button className="mt-2" onClick={check}>Analizar</Button>
                    <p className="text-xs text-muted-foreground mt-2">Para evaluaciones completas usa herramientas clínicas especializadas y consulta a tu médico.</p>
                </div>
                <div className="md:col-span-2">
                    {res.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Sin resultados por ahora.</div>
                    ) : (
                        <div className="space-y-2">
                            {res.map((r, idx) => (
                                <div key={idx} className="p-3 rounded-xl border flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{r.med}</div>
                                        <div className="text-xs text-muted-foreground">Posible interacción: {r.riesgo}</div>
                                    </div>
                                    <Badge variant="destructive">Verificar</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
}

function Ayuda() {
    return (
        <Section icon={Info} title="Ayuda, privacidad y notas legales" subtitle="Lee con atención antes de usar.">
            <div className="space-y-3 text-sm leading-relaxed">
                <p><strong>Propósito educativo:</strong> Este prototipo busca facilitar el acceso a información general sobre medicamentos en México y proveer herramientas de organización personal.</p>
                <p><strong>No es asesoría médica:</strong> No tomes decisiones clínicas basadas sólo en este sitio. Consulta a tu profesional de salud.</p>
                <p><strong>Recetas médicas:</strong> Para fármacos de receta, verifica requisitos y conserva tu documento. La venta/entrega depende de la farmacia.</p>
                <p><strong>Privacidad:</strong> En este prototipo todo se guarda en tu propio navegador (localStorage). Borra datos desde la sección correspondiente o limpia el almacenamiento del navegador.</p>
                <p><strong>Fuentes externas:</strong> Enlaces a COFEPRIS, PubMed y Cochrane se ofrecen para ampliar información. Su contenido puede cambiar sin previo aviso.</p>
            </div>
        </Section>
    );
}

// ===== App principal =====
export default function PastillasApp() {
    const [tab, setTab] = useState("inicio");
    const [query, setQuery] = useState("");

    // Pequeñas auto-pruebas en consola para evitar regresiones
    useEffect(() => {
        if (typeof window === 'undefined' || window.__PASTILLAS_TESTED__) return;
        window.__PASTILLAS_TESTED__ = true;
        try {
            console.assert(Array.isArray(MEDICINAS) && MEDICINAS.length >= 7, "El catálogo debe tener 7 medicamentos");
            const campos = ["id", "nombre", "principioActivo", "categoria", "indicaciones", "presentaciones", "advertencias", "efectosSecundarios", "interacciones", "requiereReceta", "comprarEn", "papers"];
            MEDICINAS.forEach(m => campos.forEach(c => console.assert(m.hasOwnProperty(c), `Falta campo ${c} en ${m.id}`)));
            const amox = MEDICINAS.find(m => m.id === "amoxicilina");
            console.assert(!!amox && amox.requiereReceta === true, "Amoxicilina debe requerir receta");
            console.assert(typeof Inicio === 'function' && typeof Medicinas === 'function' && typeof Recetas === 'function' && typeof Alarmas === 'function' && typeof Educacion === 'function' && typeof Interacciones === 'function' && typeof Ayuda === 'function', "Componentes principales deben existir");
            console.info("Auto-pruebas OK ✔");
        } catch (e) { console.warn("Auto-pruebas fallaron:", e); }
    }, []);

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-white text-zinc-900">
                <Toaster position="top-right" richColors />
                {/* Navbar */}
                <div className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
                    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Pill className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold">pastillas.app</span>
                            <Badge variant="outline" className="ml-2">MX</Badge>
                        </div>
                        <div className="flex-1 max-w-xl hidden md:flex">
                            <div className="w-full relative">

                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout */}
                <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[220px,1fr] gap-6">
                    {/* Sidebar */}
                    <aside className="space-y-1">
                        {[
                            { id: "inicio", label: "Inicio", icon: Home },
                            { id: "medicinas", label: "Medicinas", icon: Pill },
                            { id: "recetas", label: "Recetas médicas", icon: FileText },
                            { id: "alarmas", label: "Alarmas", icon: Bell },
                            { id: "educacion", label: "Educación", icon: GraduationCap },
                            { id: "interacciones", label: "Interacciones", icon: Stethoscope },
                            { id: "estudios", label: "Estudios", icon: FlaskRound },
                            { id: "ayuda", label: "Ayuda & Privacidad", icon: Info },
                        ].map(i => (
                            <button key={i.id} onClick={() => setTab(i.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${tab === i.id ? "bg-indigo-50 border-indigo-400" : "hover:bg-muted"}`}>
                                <i.icon className="w-4 h-4" /> {i.label}
                            </button>
                        ))}

                        <div className="mt-4 p-3 rounded-xl border text-xs text-muted-foreground">
                            <div className="font-medium text-foreground mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> Seguridad</div>
                            Tus datos se almacenan sólo en tu navegador en este prototipo.
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="space-y-6">
                        <AnimatePresence mode="wait">
                            {tab === "inicio" && (
                                <motion.div
                                    key="inicio"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                >
                                    <Inicio go={setTab} />
                                </motion.div>
                            )}

                            {tab === "medicinas" && (
                                <motion.div key="medicinas" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Medicinas query={query} />
                                </motion.div>
                            )}
                            {tab === "recetas" && (
                                <motion.div key="recetas" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Recetas />
                                </motion.div>
                            )}
                            {tab === "alarmas" && (
                                <motion.div key="alarmas" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Alarmas />
                                </motion.div>
                            )}
                            {tab === "educacion" && (
                                <motion.div key="educacion" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Educacion />
                                </motion.div>
                            )}
                            {tab === "interacciones" && (
                                <motion.div key="interacciones" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Interacciones />
                                </motion.div>
                            )}
                            {tab === "ayuda" && (
                                <motion.div key="ayuda" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                    <Ayuda />
                                </motion.div>
                            )}
                            {tab === "estudios" && (
                                <motion.div
                                    key="estudios"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                >
                                    <Estudios />
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </main>
                </div>

                {/* Footer */}
                <footer className="border-t py-6">
                    <div className="max-w-6xl mx-auto px-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                        <div>© {new Date().getFullYear()} pastillas.app · Prototipo educativo (MX)</div>
                        <div className="flex items-center gap-3">
                            <a className="underline" href="https://www.gob.mx/cofepris" target="_blank">COFEPRIS</a>
                            <a className="underline" href="https://salud.gob.mx" target="_blank">Secretaría de Salud</a>
                        </div>
                    </div>
                </footer>
            </div>
        </TooltipProvider>
    );
}