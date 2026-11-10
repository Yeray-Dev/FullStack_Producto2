/*
 * Prompts (IA: Claude, Anthropic) Yeray
 * 1. "¿qué necesito y qué pasos debo seguir para que el dashboard cargue los intercambios desde IndexedDB con async/await?"
 * 2. "quiero usar la API Drag and Drop con un contenedor de intercambios y otro de favoritos, ¿cómo lo planteo?"
 * 3. "¿cómo guardo la selección de favoritos para que persista al recargar la página?"
 * 4. "dame el bloque de código para mostrar un aviso al usuario si falla la carga o el guardado, y dónde va"
 */

import { languages, level, modality, type } from "./constantes.js"
import { fillSelect, getLabel, mostrarUsuarioActivo, configurarCierreSesion  } from "./utils.js"
import { sembrarIntercambios, obtenerIntercambios, obtenerUsuarios, obtenerSeleccion, seleccionarIntercambio, deseleccionarIntercambio } from "./almacenaje.js"

const mensajeError = document.querySelector("#mensaje-error")

function mostrarError(texto) {
	mensajeError.textContent = texto
	mensajeError.classList.toggle("d-none", texto === "")
}

let intercambios = []
let usuarios = []
let idSeleccion = []

try {
	await sembrarIntercambios()
	intercambios = await obtenerIntercambios()
	usuarios = await obtenerUsuarios()
	idSeleccion = await obtenerSeleccion()
} catch (error) {
	console.error(error)
	mostrarError("No se pudieron cargar los intercambios. Recarga la página.")
}
mostrarUsuarioActivo()
configurarCierreSesion()


const languageSelect = document.querySelector("#language-filter")
const levelSelect = document.querySelector("#level-filter")
const modeSelect = document.querySelector("#modality-filter")
const cardTemplate = document.querySelector("#card-template")
const cardList = document.querySelector("#card-list")
const cardListFav = document.querySelector("#card-list-fav")
const pCardListFav = document.querySelector('#fav-empty')
const selected = new Set()

fillSelect(languageSelect, languages)
fillSelect(levelSelect, level)
fillSelect(modeSelect, modality)

for (const id of idSeleccion){
	selected.add(id)
}


function createCard(exchange) {
	const card = cardTemplate.content.cloneNode(true)
	const usuario = usuarios.find(u => u.email === exchange.email)
	const li = card.querySelector("li")

	card.querySelector('[data-field="title"]').textContent = exchange.titulo
	card.querySelector('[data-field="type"]').textContent = getLabel(type, exchange.tipo)
	card.querySelector('[data-field="date"]').textContent = exchange.fecha
	card.querySelector('[data-field="language"]').textContent = getLabel(languages, exchange.idioma)
	card.querySelector('[data-field="level"]').textContent = getLabel(level, exchange.nivel)
	card.querySelector('[data-field="exchange"]').textContent = getLabel(languages, exchange.aCambioDe)
	card.querySelector('[data-field="description"]').textContent = exchange.descripcion
	card.querySelector('[data-field="modality"]').textContent = getLabel(modality, exchange.modalidad)
	card.querySelector('[data-field="availability"]').textContent = exchange.disponibilidad
	card.querySelector('[data-field="user-name"]').textContent = usuario?.name ?? "Usuario eliminado"
	card.querySelector('[data-field="faculty"]').textContent = usuario?.faculty ?? ""
	li.classList.add(exchange.tipo)

	li.draggable = true
	li.dataset.id = exchange.id

	li.addEventListener('dragstart', (event) => {
		event.dataTransfer.setData('text/plain', exchange.id)
		event.dataTransfer.effectAllowed = 'move'
		event.currentTarget.classList.add('dragging')
	})

	li.addEventListener('dragend', (event) => {
		event.currentTarget.classList.remove('dragging')
	})
	return card
}

function renderCards(list) {
	cardList.replaceChildren()
	cardListFav.replaceChildren()
	for (const exchange of list) {
		if (selected.has(exchange.id))
			cardListFav.append(createCard(exchange))
		else
			cardList.append(createCard(exchange))
	}
	pCardListFav.classList.toggle('d-none', selected.size !== 0)
}

function filterExchanges() {
	const typeFilter = document.querySelector('input[name="type"]:checked').value
	const languageFilter = document.getElementById('language-filter')
	const levelFilter = document.getElementById('level-filter')
	const modeFilter = document.getElementById('modality-filter')

	const exchangesFilter = intercambios.filter(card => {
		const matchType = typeFilter === "all" || card.tipo === typeFilter
		const matchLanguage = languageFilter.value === "all" || card.idioma === languageFilter.value
		const matchLevel = levelFilter.value === "all" || card.nivel === levelFilter.value
		const matchMode = modeFilter.value === "all" || card.modalidad === modeFilter.value

		return matchType && matchLanguage &&
			matchLevel && matchMode
	})
	renderCards(exchangesFilter)
}
filterExchanges()


const formFilter = document.getElementById('form-filter')
formFilter.addEventListener('input', filterExchanges)

for (const zone of [cardList, cardListFav]){
	zone.addEventListener('dragover', (event) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'move'
		event.currentTarget.classList.add('active-zone')
	})

	zone.addEventListener('dragleave', (event) => {
		if (event.currentTarget.contains(event.relatedTarget))
			return
		event.currentTarget.classList.remove('active-zone')
	})

	zone.addEventListener('drop', async (event) => {
		event.preventDefault()
		event.currentTarget.classList.remove('active-zone')
		const id = Number(event.dataTransfer.getData('text/plain'))
		try {
			if (event.currentTarget === cardListFav){
				await seleccionarIntercambio(id)
				selected.add(id)
			}
			else{
				await deseleccionarIntercambio(id)
				selected.delete(id)
			}
			mostrarError("")  // NUEVO: borra un aviso anterior
			filterExchanges()
		} catch (error){
			console.error('No se pudo guardar la selección:', error)
			mostrarError("No se pudo guardar la selección.")  // NUEVO
		}	})
}
