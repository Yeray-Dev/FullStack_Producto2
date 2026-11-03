
import { exchanges, users, languages, level, modality } from "./datos.js"
import { fillSelect, getLabel, nextId, showLoggedUser } from "./utils.js"


const form = document.querySelector("#exchange-form")       // El formulario
const tableBody = document.querySelector("#exchange-table") // Cuerpo de la tabla
const counter = document.querySelector("#exchange-count")   // Número del título
const currentUser = users[0]

fillSelect(document.querySelector("#language"), languages) // Idiomas
fillSelect(document.querySelector("#level"), level)        // Niveles
fillSelect(document.querySelector("#exchange"), languages) // Idiomas otra vez


function renderTable() {
	tableBody.replaceChildren() // Vaciamos la tabla

	for (const e of exchanges) {                 // Por cada intercambio...
		const isOffer = e.type === "offer"       // ¿Es una oferta?
		const row = document.createElement("tr") // Fila nueva

		row.innerHTML = `
			<td><span class="badge ${e.type}">${isOffer ? "Oferta" : "Petición"}</span></td>
			<td>${getLabel(languages, e.language)}</td>
			<td>${getLabel(level, e.level)}</td>
			<td>${getLabel(languages, e.exchange)}</td>
			<td>${getLabel(modality, e.modality)}</td>
			<td>${e.date}</td>
			<td><button type="button" class="btn btn-sm btn-outline-danger" data-id="${e.id}">Eliminar</button></td>`

		tableBody.append(row) // Ponemos la fila
	}

	counter.textContent = exchanges.length // Cuántos hay
}

renderTable()


form.addEventListener("submit", event => {
	event.preventDefault()

	const f = form.elements

	exchanges.push({
		id: nextId(exchanges),                         // Número nuevo
		type: f.type.value,                            // Oferta o petición
		date: new Date().toLocaleDateString("es-ES"),  // Fecha de hoy
		language: f.language.value,                    // Idioma
		level: f.level.value,                          // Nivel
		exchange: f.exchange.value,                    // A cambio de
		description: f.description.value,              // Descripción
		modality: f.modality.value,                    // Modalidad
		availability: "Flexible",                      // Valor fijo
		user: { name: currentUser.name, faculty: currentUser.faculty } // Quién lo publica
	})

	renderTable()
	form.reset()
})


tableBody.addEventListener("click", event => {
	const button = event.target.closest("button[data-id]") // ¿Se pulsó un "Eliminar"?
	if (!button) return                                    // Si no, no hacemos nada

	const id = Number(button.dataset.id)                // Leemos su número
	const index = exchanges.findIndex(x => x.id === id) // Buscamos su posición

	exchanges.splice(index, 1) // Lo quitamos del array
	renderTable()              // Redibujamos
})

showLoggedUser(users)
