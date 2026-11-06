// Reina Dabi · propuesta v3. Colección filtrable, armador con dibujo en vivo, cuenta regresiva y mediciones (mismas reglas que v2).
import { firebaseConfig, firebaseListo, negocio } from "../firebase-config.js";

const $ = (id) => document.getElementById(id);
const linkWA = (t) => "https://wa.me/" + negocio.whatsapp + "?text=" + encodeURIComponent(t);
const hoy = () => new Date().toLocaleDateString("en-CA");

/* ---------- Mediciones (visitas, origen, clics y ramos vistos) ---------- */
let db = null, api = null;
/* Es una propuesta: no suma a las estadísticas reales hasta que se publique (poner MEDIR = true). */
const MEDIR = false;
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
async function iniciarFirebase() {
  if (!firebaseListo || !MEDIR) return;
  try {
    const { initializeApp } = await import(FB + "firebase-app.js");
    api = await import(FB + "firebase-database.js");
    db = api.getDatabase(initializeApp(firebaseConfig));
  } catch (e) { db = null; }
}
const sumar = (ruta) => { if (db) api.set(api.ref(db, ruta), api.increment(1)).catch(() => {}); };
function fuente() {
  const q = new URLSearchParams(location.search); let s = (q.get("origen") || q.get("utm_source") || "").toLowerCase();
  try { if (!s && document.referrer) { const h = new URL(document.referrer).hostname; if (h !== location.hostname) s = h; } } catch (e) {}
  if (!s) return "directo";
  if (s.includes("instagram") || s === "ig") return "instagram";
  if (s.includes("whatsapp") || s === "wa") return "whatsapp";
  if (s.includes("facebook") || s === "fb") return "facebook";
  if (s.includes("google")) return "google";
  return "otro";
}

/* ---------- Colección ---------- */
const RAMOS = [
  { id: "r1", img: "rojas.jpg", t: "Rojas con tallo", oc: "Para el amor", cat: ["clasicos"], d: "El clásico que nunca falla: rosas rojas de tallo largo, envueltas a mano.", l: ["Rosas rojas de satén", "Tallo largo", "Envoltorio a elección"] },
  { id: "r2", img: "lila.jpg", t: "Lila y dorado", oc: "Elegancia", cat: ["detalles"], d: "Tonos lila con detalles dorados y mariposas que parecen volar.", l: ["Rosas lila", "Mariposas doradas", "Perlas"] },
  { id: "r3", img: "perfumadas.jpg", t: "21 perfumadas + corona", oc: "Para lucirse", cat: ["grandes", "detalles"], d: "Veintiún rosas perfumadas coronadas. El ramo de las grandes ocasiones.", l: ["21 rosas", "Aroma suave", "Corona dorada"] },
  { id: "r4", img: "verde_blanco.jpg", t: "Verde y blanco", oc: "Frescura", cat: ["detalles"], d: "Una combinación fresca y distinta, con mariposa dorada.", l: ["Rosas verdes y blancas", "Mariposa dorada"] },
  { id: "r5", img: "azul.jpg", t: "Azul con bombones", oc: "Sorpresa", cat: ["detalles"], d: "Rosas azules acompañadas de bombones. Dulce por donde lo mires.", l: ["Rosas azules", "Bombones", "Moño de raso"] },
  { id: "r6", img: "mariposa_rosa.jpg", t: "Rosa con mariposa", oc: "Ternura", cat: ["clasicos", "detalles"], d: "Rosa clarito con una mariposa: delicado y romántico.", l: ["Rosas rosa claro", "Mariposa"] },
  { id: "r7", img: "amarillo.jpg", t: "Cumpleaños con cinta", oc: "Feliz cumple", cat: ["cumple"], d: "Amarillo luminoso con cinta personalizada con tu mensaje.", l: ["Rosas amarillas", "Cinta con mensaje"] },
  { id: "r8", img: "rosa.jpg", t: "Rosa con mensaje", oc: "Para decir algo", cat: ["cumple", "clasicos"], d: "Rosas con cinta personalizada y mariposa. Decilo con flores que duran.", l: ["Rosas rosa", "Cinta personalizada", "Mariposa"] },
  { id: "r9", img: "corona.jpg", t: "Marfil con corona", oc: "Quince y novias", cat: ["grandes", "detalles"], d: "Verde y marfil con corona y mariposas. Para un día inolvidable.", l: ["Rosas marfil y verde", "Corona", "Mariposas"] }
];
const FILTROS = [["todos", "Todos"], ["clasicos", "Clásicos"], ["detalles", "Con detalles"], ["grandes", "Grandes"], ["cumple", "Cumpleaños"]];
let filtro = "todos";
function pintarColeccion() {
  $("filtros").innerHTML = FILTROS.map(([k, n]) => '<button type="button" data-f="' + k + '" aria-pressed="' + (k === filtro) + '">' + n + "</button>").join("");
  $("ramos").innerHTML = RAMOS.map((r, i) => '<button type="button" class="ramo rv si' + (filtro === "todos" || r.cat.includes(filtro) ? "" : " oculto") + '" data-i="' + i + '"><div class="ft"><img src="../img/' + r.img + '" alt="' + r.t + '" loading="lazy"><span class="tag">' + r.oc + '</span><span class="ver">Ver detalle</span></div><h3>' + r.t + "</h3><p>" + r.l.slice(0, 2).join(" · ") + "</p></button>").join("");
}
$("filtros").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { filtro = b.dataset.f; pintarColeccion(); } });
const det = $("det");
$("ramos").addEventListener("click", (e) => {
  const b = e.target.closest("[data-i]"); if (!b) return;
  const r = RAMOS[+b.dataset.i];
  $("d-img").src = "../img/" + r.img; $("d-img").alt = r.t; $("d-ocas").textContent = r.oc; $("d-tit").textContent = r.t; $("d-txt").textContent = r.d;
  $("d-lista").innerHTML = r.l.map((x) => "<li>" + x + "</li>").join("");
  $("d-wa").href = linkWA("¡Hola! Vi en su web el ramo \"" + r.t + "\" y lo quiero así. ¿Me pasan precio y disponibilidad? 🌹");
  $("d-armar").onclick = () => { det.close(); document.getElementById("armar").scrollIntoView({ behavior: "smooth" }); };
  det.showModal();
  sumar("web/stats/ramos/" + hoy() + "/" + r.id);
});
det.addEventListener("click", (e) => { if (e.target === det || e.target.closest(".x")) det.close(); });

/* ---------- Armador ---------- */
const OCAS = ["Cumpleaños", "Aniversario", "Egresados", "Quince", "Casamiento", "Día especial", "Sin motivo"];
const COLORES = [["Rojo", "#c0183a"], ["Rosa", "#f19ab2"], ["Rosa viejo", "#c9848f"], ["Blanco", "#fbf7f2"], ["Marfil", "#efe2c6"], ["Lila", "#b79ad6"], ["Azul", "#3e6fd8"], ["Amarillo", "#f5cf3b"], ["Negro", "#1d1a1c"], ["Verde", "#9ccc8a"]];
const ENV = ["Papel coreano", "Kraft", "Tela", "Caja sombrerera"];
const EXTRAS = [["cinta", "🎀 Cinta con mensaje"], ["mariposas", "🦋 Mariposas"], ["perlas", "✨ Perlas"], ["corona", "👑 Corona"], ["bombones", "🍫 Bombones"], ["luces", "💡 Luces LED"]];
const A = { oc: "Cumpleaños", cant: 12, col: ["Rojo"], env: "Papel coreano", ext: [] };
const botones = (el, lista, sel, multi) => { $(el).innerHTML = lista.map((x) => { const v = Array.isArray(x) ? x[0] : x, n = Array.isArray(x) ? x[1] : x; const on = multi ? sel.includes(v) : sel === v; return '<button type="button" data-v="' + v + '" aria-pressed="' + on + '">' + n + "</button>"; }).join(""); };
function pintarArmador() {
  botones("a-ocasion", OCAS, A.oc);
  $("a-colores").innerHTML = COLORES.map(([n, c]) => '<button type="button" data-v="' + n + '" aria-pressed="' + A.col.includes(n) + '" title="' + n + '" aria-label="' + n + '" style="background:' + c + '"></button>').join("");
  botones("a-env", ENV, A.env);
  botones("a-extras", EXTRAS, A.ext, true);
  $("a-cinta-box").hidden = !A.ext.includes("cinta");
  $("a-cant-v").textContent = A.cant + " rosas";
  dibujar(); resumen();
}
function dibujar() {
  const n = Math.min(A.cant, 25), cs = A.col.map((c) => COLORES.find((x) => x[0] === c)[1]), pts = [];
  for (let i = 0; i < n; i++) { const ang = i * 2.399, r = 9 * Math.sqrt(i + .6); pts.push([100 + r * Math.cos(ang), 92 + r * Math.sin(ang) * .82, cs[i % cs.length]]); }
  pts.sort((a, b) => a[1] - b[1]);
  const env = { "Papel coreano": "#f3d9df", Kraft: "#cfa77a", Tela: "#e9e1f2", "Caja sombrerera": "#2c1820" }[A.env];
  let s = '<svg viewBox="28 30 144 168" aria-hidden="true">';
  if (A.env === "Caja sombrerera") s += '<ellipse cx="100" cy="150" rx="70" ry="16" fill="#1c0f15"/><rect x="30" y="110" width="140" height="40" fill="' + env + '"/><ellipse cx="100" cy="110" rx="70" ry="16" fill="#3a2430"/>';
  else s += '<path d="M40 70 L100 190 L160 70 Z" fill="' + env + '" opacity=".95"/><path d="M58 76 L100 182 L142 76" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="2"/>';
  pts.forEach(([x, y, c]) => { s += '<g transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')"><circle r="11" fill="' + c + '"/><circle r="7" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.6"/><circle r="3.4" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.4"/></g>'; });
  if (A.ext.includes("corona")) s += '<path d="M84 42 l6 10 l10 -12 l10 12 l6 -10 l-2 18 h-28 z" fill="#d9bd7b" stroke="#b8903a"/>';
  if (A.ext.includes("mariposas")) s += '<g fill="#d9bd7b" opacity=".95"><path d="M150 60 q10 -12 14 2 q-8 4 -14 -2 z M150 60 q-2 -14 10 -12 q-2 8 -10 12 z"/><path d="M44 96 q-10 -10 -14 4 q8 4 14 -4 z M44 96 q2 -14 -10 -12 q2 8 10 12 z"/></g>';
  if (A.ext.includes("perlas")) for (let i = 0; i < 9; i++) s += '<circle cx="' + (60 + i * 10) + '" cy="' + (128 + Math.sin(i) * 3) + '" r="2.4" fill="#fff" stroke="#e3d6c3"/>';
  if (A.ext.includes("cinta")) s += '<path d="M70 150 h60 l-8 10 h-44 z" fill="#8e1e48"/><text x="100" y="158" font-size="7" text-anchor="middle" fill="#fff" font-family="Manrope">' + ($("a-cinta").value || "tu mensaje").slice(0, 22).replace(/[<&>"]/g, "") + "</text>";
  if (A.ext.includes("luces")) for (let i = 0; i < 8; i++) s += '<circle cx="' + (64 + Math.random() * 72) + '" cy="' + (60 + Math.random() * 60) + '" r="1.6" fill="#fff6c8"><animate attributeName="opacity" values="1;.2;1" dur="' + (1 + Math.random()) + 's" repeatCount="indefinite"/></circle>';
  $("a-dibujo").innerHTML = s + "</svg>";
}
function resumen() {
  const ex = A.ext.map((k) => EXTRAS.find((x) => x[0] === k)[1].replace(/^\S+\s/, ""));
  const f = $("a-fecha").value;
  const fTxt = f ? new Date(f + "T12:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "A coordinar";
  const filas = [["Ocasión", A.oc], ["Rosas", A.cant], ["Colores", A.col.join(", ")], ["Envoltorio", A.env], ["Detalles", ex.length ? ex.join(", ") : "Sin extras"], ["Para", fTxt]];
  if (A.ext.includes("cinta") && $("a-cinta").value.trim()) filas.splice(5, 0, ["Cinta", "“" + $("a-cinta").value.trim() + "”"]);
  $("a-resumen").innerHTML = filas.map(([k, v]) => "<li><span>" + k + "</span><b>" + String(v).replace(/[<&>]/g, "") + "</b></li>").join("");
  $("a-enviar").href = linkWA("¡Hola! Armé este ramo en su web 🌹\n" + filas.map(([k, v]) => "• " + k + ": " + v).join("\n") + "\n¿Me pasan el presupuesto?");
}
const toggle = (arr, v, max) => { const i = arr.indexOf(v); if (i >= 0) { if (arr.length > 1 || max === 99) arr.splice(i, 1); } else { if (arr.length >= max) arr.shift(); arr.push(v); } };
$("armar").addEventListener("click", (e) => {
  const b = e.target.closest("[data-v]"); if (!b) return; const box = b.parentElement.id, v = b.dataset.v;
  if (box === "a-ocasion") A.oc = v; else if (box === "a-colores") toggle(A.col, v, 3); else if (box === "a-env") A.env = v; else if (box === "a-extras") toggle(A.ext, v, 99);
  pintarArmador();
});
$("a-cant").addEventListener("input", (e) => { A.cant = +e.target.value; $("a-cant-v").textContent = A.cant + " rosas"; dibujar(); resumen(); });
$("a-cinta").addEventListener("input", () => { dibujar(); resumen(); });
$("a-fecha").addEventListener("change", resumen);
$("a-fecha").min = hoy();
$("a-enviar").addEventListener("click", () => sumar("web/stats/clics/" + hoy() + "/armador"));
document.querySelectorAll("[data-tam]").forEach((b) => b.addEventListener("click", () => { A.cant = +b.dataset.tam; $("a-cant").value = A.cant; pintarArmador(); document.getElementById("armar").scrollIntoView({ behavior: "smooth" }); }));

/* ---------- WhatsApp general ---------- */
const MSJ = { eventos: "¡Hola! Quiero pedir un presupuesto para un evento / regalos empresariales: ", fecha: "¡Hola! Quiero reservar un ramo para la fecha especial que se viene 🌹" };
document.querySelectorAll("[data-wa]").forEach((a) => { a.href = linkWA(MSJ[a.dataset.wa] || "¡Hola! Vi su página y quiero consultar por un ramo 🌹"); a.addEventListener("click", () => sumar("web/stats/clics/" + hoy() + "/" + a.dataset.wa)); });

/* ---------- Próxima fecha especial (cuenta regresiva) ---------- */
function proxima() {
  const y = new Date().getFullYear(), t = new Date(); t.setHours(0, 0, 0, 0);
  const tercerDomingo = (yy, m) => { const d = new Date(yy, m, 1); const add = (7 - d.getDay()) % 7; return new Date(yy, m, 1 + add + 14); };
  const L = [];
  [y, y + 1].forEach((yy) => L.push(["San Valentín", new Date(yy, 1, 14)], ["el Día de la Primavera", new Date(yy, 8, 21)], ["el Día del Amigo", new Date(yy, 6, 20)], ["el Día de la Madre", tercerDomingo(yy, 9)], ["Navidad", new Date(yy, 11, 25)], ["el Día de la Mujer", new Date(yy, 2, 8)]));
  return L.filter((x) => x[1] >= t).sort((a, b) => a[1] - b[1])[0];
}
function cuenta() {
  const [n, f] = proxima(), ms = f - new Date(), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
  $("f-tit").textContent = "Faltan " + (d + 1) + " días para " + n;
  $("f-cuenta").innerHTML = [[d, "días"], [h, "horas"], [m, "min"]].map(([v, k]) => "<div><b>" + v + "</b><span>" + k + "</span></div>").join("");
}

/* ---------- Instagram (fotos propias, link al perfil) ---------- */
$("ig").innerHTML = ["rosa.jpg", "azul.jpg", "lila.jpg", "amarillo.jpg", "verde_blanco.jpg", "mariposa_rosa.jpg"].map((f) => '<a href="https://www.instagram.com/lareina.dabi/" target="_blank" rel="noopener" aria-label="Ver en Instagram"><img src="../img/' + f + '" alt="" loading="lazy"></a>').join("");

/* ---------- Cinta de ocasiones ---------- */
const OC = ["Cumpleaños", "Aniversarios", "Egresados", "Quince", "Casamientos", "Propuestas", "Día de la Madre", "San Valentín"];
$("cinta").innerHTML = OC.concat(OC).map((o) => "<span>" + o + "</span><i>✦</i>").join("");

/* ---------- Animaciones ---------- */
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("si"); io.unobserve(e.target); } }), { threshold: .12 }) : null;
document.querySelectorAll(".rv").forEach((el) => io ? io.observe(el) : el.classList.add("si"));
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const figs = [...document.querySelectorAll("[data-par]")];
  addEventListener("scroll", () => { const y = scrollY; figs.forEach((f) => { f.style.transform = "translateY(" + (y * +f.dataset.par / 300).toFixed(1) + "px)"; }); }, { passive: true });
}
$("anio").textContent = new Date().getFullYear();

pintarColeccion(); pintarArmador(); cuenta(); setInterval(cuenta, 60000);
iniciarFirebase().then(() => {
  try { if (sessionStorage.getItem("rd_visita") === hoy()) return; sessionStorage.setItem("rd_visita", hoy()); } catch (e) {}
  sumar("web/stats/visitas/" + hoy()); sumar("web/stats/origen/" + hoy() + "/" + fuente());
});
