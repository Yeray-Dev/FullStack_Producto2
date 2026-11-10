/*
 * Prompts (IA: Claude, Anthropic)
 * 1. "¿Cómo puedo hacer que el gráfico se vea responsive?"
 * 2. "¿Cómo hago que las barras no se vean enormes en pantallas anchas?"
 * 3. "¿Qué diferencia hay entre `async/await` y usar `.then()`, y cuál me conviene aquí? explicamelos"
 * 4. "Porque usar math? que diferencias hay?"
 */
import * as almacenaje from "./almacenaje.js"
import { formatDate, fillSelect } from "./utils.js"
import { languages, level, modality } from "./constantes.js"
import { mostrarUsuarioActivo, configurarCierreSesion } from "./utils.js"

const formulario = document.querySelector("#exchange-form")
const cuerpoTabla = document.querySelector("#exchange-table")
const mensajeError = document.querySelector("#mensaje-error")
const canvas = document.querySelector("#grafico")
const zonaGrafico = document.querySelector("#zona-grafico")
let ultimaLista = []

const TIPOS = { offer: "Ofrezco idioma", request: "Busco idioma" }

fillSelect(formulario.elements.idioma, languages)
fillSelect(formulario.elements.nivel, level)
fillSelect(formulario.elements.aCambioDe, languages)
fillSelect(formulario.elements.modalidad, modality)


function mostrarError(texto) {
	mensajeError.textContent = texto
	mensajeError.classList.toggle("d-none", texto === "")
}

function validar(i) {
	if (i.titulo === "") return "El título es obligatorio."
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email)) return "El email no es válido."
	if (i.fecha === "") return "Elige una fecha."
	if (i.descripcion === "") return "La descripción es obligatoria."
	if (!almacenaje.obtenerUsuarios().some(u => u.email === i.email)) return "Ese email no pertenece a ningún usuario registrado."
	if (i.tipo === "") return "Elige el tipo de intercambio."
	if (i.idioma === "") return "Elige el idioma."
	if (i.nivel === "") return "Elige el nivel."
	if (i.aCambioDe === "") return "Elige el idioma que quieres a cambio."
	if (i.idioma === i.aCambioDe) return "El idioma y el idioma a cambio no pueden ser el mismo."
	if (i.modalidad === "") return "Elige la modalidad."
	if (i.disponibilidad === "") return "Indica tu disponibilidad."
	return ""
}


function dibujarGrafico(lista) {
	ultimaLista = lista

	const ANCHO = zonaGrafico.clientWidth
	const ALTO = Math.min(Math.round(ANCHO * 0.6), 320)
	const ratio = window.devicePixelRatio || 1

	canvas.width = ANCHO * ratio
	canvas.height = ALTO * ratio
	canvas.style.width = ANCHO + "px"
	canvas.style.height = ALTO + "px"

	const ctx = canvas.getContext("2d")
	ctx.scale(ratio, ratio)

	const ofertas = lista.filter(i => i.tipo === "offer").length
	const peticiones = lista.filter(i => i.tipo === "request").length
	const maximo = Math.max(ofertas, peticiones, 1)

	const margen = 40
	const base = ALTO - 40
	const alturaMaxima = ALTO - 90
	const anchoBarra = Math.min(ANCHO / 5, 120)
	ctx.clearRect(0, 0, ANCHO, ALTO)

	ctx.strokeStyle = "#6b6a66"
	ctx.beginPath()
	ctx.moveTo(margen, base)
	ctx.lineTo(ANCHO - margen, base)
	ctx.stroke()

	const barras = [
		{ nombre: "Ofrezco", valor: ofertas, color: "#00876d", x: ANCHO * 0.25 - anchoBarra / 2 },
		{ nombre: "Busco", valor: peticiones, color: "#6959ae", x: ANCHO * 0.75 - anchoBarra / 2 }
	]

	ctx.font = "14px sans-serif"
	ctx.textAlign = "center"

	for (const barra of barras) {
		const alto = (barra.valor / maximo) * alturaMaxima

		ctx.fillStyle = barra.color
		ctx.fillRect(barra.x, base - alto, anchoBarra, alto)

		ctx.fillStyle = "#1c1b19"
		ctx.fillText(String(barra.valor), barra.x + anchoBarra / 2, base - alto - 8)
		ctx.fillText(barra.nombre, barra.x + anchoBarra / 2, base + 22)
	}
}


async function consultarIntercambios() {
	try {
		await almacenaje.sembrarIntercambios()
		const lista = await almacenaje.obtenerIntercambios()
		listarIntercambios(lista)
		dibujarGrafico(lista)
	} catch (error) {
		mostrarError("No se pudieron cargar los intercambios.")
	}
}


function listarIntercambios(lista) {
	cuerpoTabla.replaceChildren()

	for (const i of lista) {
		const fila = document.createElement("tr")

		for (const dato of [i.titulo, i.email, formatDate(i.fecha), i.descripcion]) {
			const celda = document.createElement("td")
			celda.textContent = dato
			fila.append(celda)
		}

		const celdaTipo = document.createElement("td")
		const etiqueta = document.createElement("span")
		etiqueta.className = "badge " + i.tipo
		etiqueta.textContent = TIPOS[i.tipo]
		celdaTipo.append(etiqueta)
		fila.append(celdaTipo)

		const celdaBoton = document.createElement("td")
		const boton = document.createElement("button")
		boton.type = "button"
		boton.className = "btn btn-sm btn-outline-danger"
		boton.dataset.id = i.id
		boton.textContent = "Borrar"
		celdaBoton.append(boton)
		fila.append(celdaBoton)

		cuerpoTabla.append(fila)
	}
}


async function publicarIntercambio(event) {
	event.preventDefault()

	const f = formulario.elements
	const intercambio = {
		titulo: f.titulo.value.trim(),
		email: f.email.value.trim().toLowerCase(),
		fecha: f.fecha.value,
		descripcion: f.descripcion.value.trim(),
		tipo: f.tipo.value,
		idioma: f.idioma.value,
		nivel: f.nivel.value,
		aCambioDe: f.aCambioDe.value,
		modalidad: f.modalidad.value,
		disponibilidad: f.disponibilidad.value.trim()
	}

	const error = validar(intercambio)
	if (error !== "") {
		mostrarError(error)
		return
	}

	try {
		await almacenaje.publicarIntercambio(intercambio)
		mostrarError("")
		formulario.reset()
		await consultarIntercambios()
	} catch (error) {
		mostrarError("No se pudo guardar el intercambio.")
	}
}


async function borrarIntercambio(event) {
	const boton = event.target.closest("button[data-id]")
	if (!boton) return

	try {
		await almacenaje.borrarIntercambio(Number(boton.dataset.id))
		await consultarIntercambios()
	} catch (error) {
		mostrarError("No se pudo borrar el intercambio.")
	}
}


formulario.addEventListener("submit", publicarIntercambio)
cuerpoTabla.addEventListener("click", borrarIntercambio)
window.addEventListener("resize", () => dibujarGrafico(ultimaLista))


mostrarUsuarioActivo()
configurarCierreSesion()
consultarIntercambios()
