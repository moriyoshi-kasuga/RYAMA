const $username = document.getElementById('id_username')
const $password = document.getElementById('id_password')
const $form = document.getElementById('form')
const $send = document.getElementById('send')
$send.addEventListener('click', () => {
  const $error = document.querySelector('.error')
  $error.textContent = null
  if ($username.value.trim().length === 0) {
    $error.textContent = 'Please input username'
    return
  }
  if ($password.value.trim().length === 0) {
    $error.textContent = 'Please input password'
    return
  }
  $form.submit()
})
