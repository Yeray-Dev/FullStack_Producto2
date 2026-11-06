import { loguearUsuario } from "./almacenaje.js"


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

	try{
		const user = loguearUsuario(inputEmail.value, inputPass.value)

		if (user) {
			window.location.href = "dashboard.html"
			return
		}
		inputEmail.classList.add("is-invalid")
		inputPass.classList.add("is-invalid")
	
	} catch (error){
		

	}

})