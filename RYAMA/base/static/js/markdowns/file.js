const id = window.location.pathname.replace('/markdowns/', '')

document.getElementById(`File-${id}`).classList.add('file-open')

function getCookie (name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

const $file = document.getElementById('file')

$file.addEventListener('change', (event) => {
  const csrftoken = getCookie('csrftoken')
  const $file = event.currentTarget
  const data = { id, body: $file.value }
  fetch('/api/save/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        console.log('ファイル保存の際になぜかできていません')
      }
    })
    .catch((error) => {
      console.log(error)
    })
})

$file.addEventListener('input', (event) => {
  syncPreview(event.currentTarget.value)
})

async function syncPreview (content) {
  const csrftoken = getCookie('csrftoken')
  const data = { content }
  await fetch('/api/preview/', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrftoken },
    body: JSON.stringify(data),
    mode: 'same-origin'
  })
    .then((response) => response.text())
    .then((data) => {
      document.querySelector('.markdown-body').innerHTML = data
    })
    .catch((error) => {
      console.log(error)
    })
}
