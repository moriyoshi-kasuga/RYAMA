const $username = document.getElementById('id_username')
const $password1 = document.getElementById('id_password1')
const $password2 = document.getElementById('id_password2')
const $form = document.getElementById('form')
const $send = document.getElementById('send')
$send.addEventListener('click', () => {
  const $error = document.querySelector('.error')
  $error.textContent = null
  if ($username.value.trim().length === 0) {
    $error.textContent = 'Please input username'
    return
  }
  const password1 = $password1.value
  const password2 = $password2.value
  if (password1.trim().length === 0) {
    $error.textContent = 'Please input password'
    return
  }
  if (password2.trim().length === 0) {
    $error.textContent = 'Please input confirmation password'
    return
  }
  if (password1 !== password2) {
    $error.textContent = 'Password not match'
    $password1.value = null
    $password2.value = null
    $password1.focus()
    return
  }
  $form.submit()
})
