import { languages, level, modality, exchanges, type, users } from "./datos.js"
import { fillSelect, getLabel, showLoggedUser } from "./utils.js"

showLoggedUser(users)

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

	card.querySelector('[data-field="type"]').textContent = getLabel(type, exchange.type)
	card.querySelector('[data-field="date"]').textContent = exchange.date
	card.querySelector('[data-field="language"]').textContent = getLabel(languages, exchange.language)
	card.querySelector('[data-field="level"]').textContent = getLabel(level, exchange.level)
	card.querySelector('[data-field="exchange"]').textContent = getLabel(languages, exchange.exchange)
	card.querySelector('[data-field="description"]').textContent = exchange.description
	card.querySelector('[data-field="modality"]').textContent = getLabel(modality, exchange.modality)
	card.querySelector('[data-field="availability"]').textContent = exchange.availability
	card.querySelector('[data-field="user-name"]').textContent = exchange.user.name
	card.querySelector('[data-field="faculty"]').textContent = exchange.user.faculty
	card.querySelector("li").classList.add(exchange.type)
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

	const exchangesFilter = exchanges.filter(card => {
		const matchType = typeFilter === "all" || card.type === typeFilter
		const matchLanguage = languageFilter.value === "all" || card.language === languageFilter.value
		const matchLevel = levelFilter.value === "all" || card.level === levelFilter.value
		const matchMode = modeFilter.value === "all" || card.modality === modeFilter.value

		return matchType && matchLanguage &&
			matchLevel && matchMode
	})
	renderCards(exchangesFilter)
}

filterExchanges()

const formFilter = document.getElementById('form-filter')
formFilter.addEventListener('input', filterExchanges)
