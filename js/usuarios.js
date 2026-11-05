import { languages, roles } from "./constantes.js"
import * as almacenaje from "./almacenaje.js"
import { fillSelect, getLabel, getInitials, formatDate } from "./utils.js"

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
const activeUserName = document.querySelector("#usuarioActivo")
const activeUserInitials = document.querySelector("#active-user-initials")
const logoutLink = document.querySelector("#logout-link")

let users = []
let pendingId = null

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

fillSelect(languageSelect, languages)
fillSelect(roleSelect, roles)
languageSelect.value = "es"

function loadUsers() {
	users = almacenaje.obtenerUsuarios()
}

function showActiveUser() {
	const email = almacenaje.obtenerUsuarioActivo()
	const user = users.find(user => user.email === email)

	activeUserName.textContent = user ? user.name : "-no login-"
	activeUserInitials.textContent = user ? getInitials(user.name) : "?"
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
	row.querySelector('[data-action="delete"]').dataset.id = user.id
	return row
}

function renderUsers(list) {
	userList.replaceChildren()
	for (const user of list) {
		userList.append(createRow(user))
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

function showToast(title, message) {
	toastTitle.textContent = title
	toastMessage.textContent = message
	userToast.show()
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

	almacenaje.crearUsuario({
		name,
		email,
		password,
		faculty: "",
		nativeLanguage: languageSelect.value,
		role: roleSelect.value
	})

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
	const button = event.target.closest('[data-action="delete"]')
	if (!button)
		return

	const user = users.find(user => user.id === Number(button.dataset.id))
	pendingId = user.id
	deleteName.textContent = user.name
	deleteEmail.textContent = user.email
	deleteModal.show()
})

confirmDeleteButton.addEventListener("click", () => {
	const removed = almacenaje.borrarUsuario(pendingId)

	pendingId = null
	loadUsers()
	renderUsers(getVisibleUsers())
	deleteModal.hide()
	showToast("Usuario eliminado", `${removed.name} ya no tiene acceso.`)
})

searchInput.addEventListener("input", () => {
	renderUsers(getVisibleUsers())
})

logoutLink.addEventListener("click", () => {
	almacenaje.cerrarSesion()
})

loadUsers()
renderUsers(users)
showActiveUser()
