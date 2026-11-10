/*
 * Prompts (IA: Claude, Anthropic)
 * 1. "como planificarias el desarrollo de la interfaz de gestion de usuarios para pasar de datos en memoria a localStorage sin romper lo que ya funciona?"	
 * 2. "revisa usuarios.js porque tengo errores, dime que he puesto mal en el codigo "
 */

import { languages, roles } from "./constantes.js"
import * as almacenaje from "./almacenaje.js"
import { fillSelect, getLabel, getInitials, formatDate, mostrarUsuarioActivo, configurarCierreSesion } from "./utils.js"


const userForm = document.querySelector("#user-form")
const nameInput = document.querySelector("#user-name")
const emailInput = document.querySelector("#user-email")
const emailFeedback = document.querySelector("#email-feedback")
const passwordInput = document.querySelector("#user-password")
const languageSelect = document.querySelector("#user-language")
const roleSelect = document.querySelector("#user-role")
const userCount = document.querySelector("#user-count")
const userList = document.querySelector("#user-list")
const rowTemplate = document.querySelector("#user-row-template")
const toastTitle = document.querySelector("#toast-title")
const toastMessage = document.querySelector("#toast-message")
const userToast = bootstrap.Toast.getOrCreateInstance("#user-toast")
const deleteName = document.querySelector("#delete-name")
const deleteEmail = document.querySelector("#delete-email")
const confirmDeleteButton = document.querySelector("#confirm-delete")
const deleteModal = bootstrap.Modal.getOrCreateInstance("#delete-modal")
const searchInput = document.querySelector("#user-search")
const toastIcon = document.querySelector("#user-toast .toast-icon")

let users = []
let pendingId = null

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

fillSelect(languageSelect, languages)
fillSelect(roleSelect, roles)
languageSelect.value = "es"

function loadUsers() {
	try {
		users = almacenaje.obtenerUsuarios()
	} catch (error) {
		users = []
		showError(error)
	}
}


function createRow(user) {
	const row = rowTemplate.content.cloneNode(true)
	const createdAt = row.querySelector('[data-field="createdAt"]')

	row.querySelector('[data-field="initials"]').textContent = getInitials(user.name)
	row.querySelector('[data-field="name"]').textContent = user.name
	row.querySelector('[data-field="email"]').textContent = user.email
	row.querySelector('[data-field="nativeLanguage"]').textContent = getLabel(languages, user.nativeLanguage)
	row.querySelector('[data-field="role"]').textContent = getLabel(roles, user.role)
	row.querySelector(".role-badge").classList.add("role-" + user.role)
	createdAt.textContent = formatDate(user.createdAt)
	createdAt.dateTime = user.createdAt
	for (const button of row.querySelectorAll("[data-action]"))
		button.dataset.id = user.id
	return row
}

function renderUsers(list) {
	userList.replaceChildren()
	for (const user of list) {
		userList.append(createRow(user))
	}

	if (list.length === 0) {
		const row = document.createElement("tr")
		const cell = document.createElement("td")
		cell.colSpan = 8
		cell.className = "text-center text-body-secondary py-4"
		cell.textContent = users.length === 0 ? "Todavía no hay usuarios registrados." : "Ningún usuario coincide con la búsqueda."
		row.append(cell)
		userList.append(row)
	}

	userCount.textContent = users.length
}

function getVisibleUsers() {
	const text = searchInput.value.trim().toLowerCase()
	return users.filter(user =>
		user.name.toLowerCase().includes(text) ||
		user.email.toLowerCase().includes(text)
	)
}

function showToast(title, message, isError = false) {
	toastTitle.textContent = title
	toastMessage.textContent = message
	toastIcon.classList.toggle("bi-check-circle-fill", !isError)
	toastIcon.classList.toggle("bi-x-circle-fill", isError)
	toastIcon.classList.toggle("is-error", isError)
	userToast.show()
}

function showError(error) {
	showToast("No se ha podido completar", error.message, true)
}

function togglePassword(button, user) {
	const text = button.closest("td").querySelector('[data-field="password"]')
	const icon = button.querySelector(".bi")
	const visible = button.dataset.visible === "true"

	text.textContent = visible ? "••••••••" : user.password
	icon.classList.toggle("bi-eye", visible)
	icon.classList.toggle("bi-eye-slash", !visible)
	button.dataset.visible = String(!visible)
	button.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña")
}

userForm.addEventListener("submit", event => {
	event.preventDefault()

	const name = nameInput.value.trim()
	const email = emailInput.value.trim().toLowerCase()
	const password = passwordInput.value

	const nameOk = name !== ""
	const emailOk = emailPattern.test(email)
	const emailRepeated = users.some(user => user.email.toLowerCase() === email)
	const passwordOk = password.length >= 8

	if (emailRepeated)
		emailFeedback.textContent = "Ya existe un usuario con este email."
	else
		emailFeedback.textContent = "Escribe un email válido."

	nameInput.classList.toggle("is-invalid", !nameOk)
	emailInput.classList.toggle("is-invalid", !emailOk || emailRepeated)
	passwordInput.classList.toggle("is-invalid", !passwordOk)

	if (!nameOk || !emailOk || emailRepeated || !passwordOk)
		return

	try {
		almacenaje.crearUsuario({
			name,
			email,
			password,
			faculty: "",
			nativeLanguage: languageSelect.value,
			role: roleSelect.value
		})
	} catch (error) {
		showError(error)
		return
	}

	loadUsers()
	userForm.reset()
	languageSelect.value = "es"
	renderUsers(getVisibleUsers())
	showToast("Usuario creado", `${name} ya puede iniciar sesión.`)
})

userForm.addEventListener("input", event => {
	event.target.classList.remove("is-invalid")
})

userList.addEventListener("click", event => {
	const button = event.target.closest("[data-action]")
	if (!button)
		return

	const user = users.find(user => user.id === Number(button.dataset.id))

	if (!user) {
		showError(new Error("Ese usuario ya no existe."))
		loadUsers()
		renderUsers(getVisibleUsers())
		return
	}

	if (button.dataset.action === "toggle-password") {
		togglePassword(button, user)
		return
	}

	pendingId = user.id
	deleteName.textContent = user.name
	deleteEmail.textContent = user.email
	deleteModal.show()
})

confirmDeleteButton.addEventListener("click", () => {
	try {
		const removed = almacenaje.borrarUsuario(pendingId)
		loadUsers()
		renderUsers(getVisibleUsers())
		showToast("Usuario eliminado", `${removed.name} ya no tiene acceso.`)
	} catch (error) {
		showError(error)
	} finally {
		pendingId = null
		deleteModal.hide()
	}
})

searchInput.addEventListener("input", () => {
	renderUsers(getVisibleUsers())
})


loadUsers()
renderUsers(users)
mostrarUsuarioActivo()
configurarCierreSesion()
