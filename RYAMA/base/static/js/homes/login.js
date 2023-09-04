const $form = document.getElementById('form')
const $send = document.getElementById('send')
$send.addEventListener('click', () => {
  const $error = document.querySelector('.error')
  $error.textContent = null
  $form.submit()
})
