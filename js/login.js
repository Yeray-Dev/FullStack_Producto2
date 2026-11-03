import { users } from "./datos.js"

const loginForm = document.getElementById("login-form")
const inputEmail = document.getElementById("email")
const inputPass = document.getElementById("password")
const buttonEye = document.getElementById("toggle-password")
const eyeIcon = document.getElementById("eye-icon")

buttonEye.addEventListener("click", () => {
	const visible = inputPass.type === "text"
	inputPass.type = visible ? "password" : "text"
	eyeIcon.classList.toggle("bi-eye", visible)
	eyeIcon.classList.toggle("bi-eye-slash", !visible)
	buttonEye.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña")
})

loginForm.addEventListener("submit", event => {
	event.preventDefault()

	inputEmail.classList.remove("is-invalid")
	inputPass.classList.remove("is-invalid")

	const email = inputEmail.value.trim().toLowerCase()
	const password = inputPass.value
	const user = users.find(u => u.email.toLowerCase() === email && u.password === password)

	if (user) {
		window.location.href = "dashboard.html?email=" + encodeURIComponent(user.email)
		return
	}

	const emailExists = users.some(u => u.email.toLowerCase() === email)
	if (!emailExists)
		inputEmail.classList.add("is-invalid")
	inputPass.classList.add("is-invalid")
})

