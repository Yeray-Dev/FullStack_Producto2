import { languages, level, modality, type } from "./constantes.js"
import { fillSelect, getLabel, showLoggedUser } from "./utils.js"
import { sembrarIntercambios, obtenerIntercambios, obtenerUsuarios } from "./almacenaje.js"

await sembrarIntercambios()
const intercambios = await obtenerIntercambios()
const usuarios = await obtenerUsuarios()
showLoggedUser(usuarios)

const languageSelect = document.querySelector("#language-filter")
const levelSelect = document.querySelector("#level-filter")
const modeSelect = document.querySelector("#modality-filter")
const cardTemplate = document.querySelector("#card-template")
const cardList = document.querySelector("#card-list")

fillSelect(languageSelect, languages)
fillSelect(levelSelect, level)
fillSelect(modeSelect, modality)

function createCard(exchange) {
	const card = cardTemplate.content.cloneNode(true)
	const usuario = usuarios.find(u => u.email === exchange.email)

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
	card.querySelector("li").classList.add(exchange.tipo)
	return card
}

function renderCards(list) {
	cardList.replaceChildren()
	for (const exchange of list) {
		cardList.append(createCard(exchange))
	}
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
