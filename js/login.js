import { loguearUsuario } from "./almacenaje.js"
import { mostrarUsuarioActivo, configurarCierreSesion } from "./utils.js"

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


const loginAlert = document.getElementById("login-alert")

	function mostrarError(mensaje) {
		loginAlert.textContent = mensaje
		loginAlert.classList.remove("d-none")
	}

	function ocultarError(){
		loginAlert.classList.add("d-none")
	}

function validarCampos(email, password, emailValido){
	const errores = {}

	if(email.trim() === "") errores.email = "Completa el email"
	else if (!emailValido) errores.email = "Email no válido"
	if (password === "") errores.password = "Completa la contraseña"

	return errores
}

loginForm.addEventListener("submit", event => {
	event.preventDefault()

	inputEmail.classList.remove("is-invalid")
	inputPass.classList.remove("is-invalid")
	ocultarError()

	const errores = validarCampos(inputEmail.value, inputPass.value, inputEmail.checkValidity())
	if (Object.keys(errores).length > 0) {
		if (errores.email) inputEmail.classList.add("is-invalid")
		if (errores.password)  inputPass.classList.add("is-invalid")

		if(errores.email) inputEmail.focus()
		else if (errores.password) inputPass.focus()

		mostrarError(Object.values(errores)[0])
		return
	}
	try{
		const user = loguearUsuario(inputEmail.value, inputPass.value)

		if (user) {
			window.location.href = "dashboard.html"
			return
		}

		inputEmail.classList.add("is-invalid")
		inputPass.classList.add("is-invalid")
		mostrarError("No hemos podido iniciar sesión. El email o la contraseña no son correctos.")
	} catch (error){
		console.error(error)
		mostrarError("Recargue la página y pruebe de nuevo")
	}
})

mostrarUsuarioActivo()
configurarCierreSesion()
