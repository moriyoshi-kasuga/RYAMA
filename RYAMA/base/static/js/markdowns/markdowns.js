// eslint-disable-next-line no-undef
hljs.highlightAll()

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

function loadExplorer (success = null) {
  fetch('/api/explorer/')
    .then((response) => response.text())
    .then((data) => {
      $explorerBody.innerHTML = data
      if (success !== null) {
        success()
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

function setActiveFile (id) {
  localStorage.setItem('activeItem', id)
}

function removeActiveFile (id) {
  localStorage.removeItem('activeItem')
}

function checkActiveExisits () {
  if (document.getElementById(`File-${getActiveFile()}`) === null) {
    removeActiveFile()
    document.getElementById('markdown').style = 'display:none'
    window.history.replaceState(null, null, '/markdowns/')
  }
}

function getActiveFile () {
  return localStorage.getItem('activeItem')
}

const $markdownBody = document.querySelector('.markdown-body')

async function syncPreview (content) {
  // eslint-disable-next-line no-undef
  $markdownBody.innerHTML = marked.parse(content)
  // eslint-disable-next-line no-undef
  hljs.highlightAll()
  // TODO: https://marked.js.org/using_pro#renderer これをみて色とかのcss変更だったりして虹のように飾れるようにしよう
}

const $content = document.getElementById('content')

$content.addEventListener('change', (event) => {
  const csrftoken = getCookie('csrftoken')
  const $file = event.currentTarget
  const data = { id: getActiveFile(), body: $file.value, option: 'content' }
  fetch('/api/file/', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
      }
    })
    .catch((error) => {
      console.log(error)
    })
})

$content.addEventListener('input', (event) => {
  syncPreview(event.currentTarget.value)
})

$content.onkeydown = (e) => {
  if (e.code !== 'Tab') { return }
  e.preventDefault()
  const newPos = $content.selectionStart + 1
  const value = $content.value
  const head = value.slice(0, $content.selectionStart)
  const foot = value.slice($content.selectionEnd)
  $content.value = head + '\t' + foot
  $content.setSelectionRange(newPos, newPos)
}

if (window.location.pathname === '/markdowns/' && getActiveFile() !== null) {
  const csrftoken = getCookie('csrftoken')
  fetch(`/api/file/${getActiveFile()}`, {
    method: 'GET',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        window.location.pathname = ('/markdowns/' + getActiveFile())
      }
      removeActiveFile()
    })
    .catch(() => {
      removeActiveFile()
    })
}

const $explorerBody = document.getElementById('ExplorerBody')

$content.addEventListener('scroll', () => {
  const fileBody = $content.scrollHeight - 910
  const fileParseint = $content.scrollTop / fileBody
  const markdownBody = $markdownBody.scrollHeight - 910
  $markdownBody.scrollTop = markdownBody * fileParseint
})

function setOpens (ids) {
  localStorage.setItem('openFolders', JSON.stringify({ ids }))
}

if (localStorage.getItem('openFolders') === null) {
  setOpens([])
}

function getOpens () {
  return JSON.parse(localStorage.getItem('openFolders')).ids
}

function containOpen (id) {
  return getOpens().includes(id)
}

function addOpen (id) {
  if (containOpen(id)) {
    return
  }
  setOpens([...getOpens(), id])
}

function removeOpen (id) {
  if (!containOpen(id)) {
    return
  }
  setOpens(getOpens().filter(i => i !== id))
}

// BLOCK: ContextMenus
let enableContextMenu = null
const $contextMenus = document.querySelector('.ContextMenus')

const resetContextMenu = () => {
  if (enableContextMenu !== null) {
    enableContextMenu.style = 'none'
  }
}

const $explorerContextMenu = $contextMenus.querySelector('.ExplorerBodyContextMenu')

$explorerContextMenu.querySelector('.ContextMenuItem--explorerNewFile').addEventListener('click', () => {
  fileCreateOfExplorer()
})

$explorerContextMenu.querySelector('.ContextMenuItem--explorerNewFolder').addEventListener('click', () => {
  folderCreateOfExplorer()
})

const $fileContextMenu = $contextMenus.querySelector('.FileContextMenu')
const $fileContextMenuId = $fileContextMenu.querySelector('.fileId')

$fileContextMenu.querySelector('.ContextMenuItem--fileDelete').addEventListener('click', () => {
  fileDelete($fileContextMenuId.textContent)
})

$fileContextMenu.querySelector('.ContextMenuItem--fileRename').addEventListener('click', () => {
  fileRename($fileContextMenuId.textContent)
})

const $folderContextMenu = $contextMenus.querySelector('.FolderContextMenu')

const $folderContextMenuId = $folderContextMenu.querySelector('.folderId')

$folderContextMenu.querySelector('.ContextMenuItem--newFile').addEventListener('click', () => {
  fileCreate($folderContextMenuId.textContent)
})

$folderContextMenu.querySelector('.ContextMenuItem--newFolder').addEventListener('click', () => {
  folderCreate($folderContextMenuId.textContent)
})

$folderContextMenu.querySelector('.ContextMenuItem--folderDelete').addEventListener('click', () => {
  folderDelete($folderContextMenuId.textContent)
})

$folderContextMenu.querySelector('.ContextMenuItem--folderRename').addEventListener('click', () => {
  folderRename($folderContextMenuId.textContent)
})

function showContextMenu (contextMenu, x, y) {
  resetContextMenu()
  enableContextMenu = contextMenu
  contextMenu.style.display = 'block'
  contextMenu.style.left = `${x}px`
  contextMenu.style.top = `${y}px`
}

document.addEventListener('click', () => {
  resetContextMenu()
})

document.querySelectorAll('.PaneBody').forEach(($Pane) => {
  $Pane.addEventListener('contextmenu', (event) => {
    if (event.target === event.currentTarget) {
      showContextMenu(
        $contextMenus.querySelector(`.${event.target.id}ContextMenu`),
        event.pageX,
        event.pageY
      )
    }
  })
})

// BLOCK: Explorer Pane

const $LeftPane = document.querySelector('.LeftPaneContainer')
const $explorerPane = document.getElementById('explorer')

document.querySelectorAll('.explorer-toggle').forEach(($toggle) => {
  $toggle.addEventListener('click', () => {
    if ($LeftPane.style.display === 'none') {
      $LeftPane.style.display = 'block'
    } else {
      $LeftPane.style.display = 'none'
    }
  })
})

document.querySelectorAll('.explorer-close').forEach(($close) => {
  $close.addEventListener('click', () => {
    $LeftPane.style.display = 'none'
  })
})

document.querySelectorAll('.explorer-open').forEach(($open) => {
  $open.addEventListener('click', () => {
    $LeftPane.style.display = 'block'
  })
})

let $renameElement = null
function resetRename (newRename = null) {
  if ($renameElement !== null) {
    $renameElement.classList.remove('rename-item')
    $renameElement = null
  }
  if (newRename !== null) {
    newRename.classList.add('rename-item')
    const $input = newRename.querySelector('.pane-item-input')
    $input.value = newRename.querySelector('.pane-item-title').textContent
    $input.focus()
    $input.select()
    $renameElement = newRename
  }
}

function fileCreateOfExplorer () {
  const csrftoken = getCookie('csrftoken')
  fetch('/api/explorer/file/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      const $children = $explorerBody.children
      let breaked = true
      for (const $item of $children) {
        if (!$item.classList.contains('FolderItem')) {
          console.log($item.id)
          $item.insertAdjacentHTML('beforebegin', data.successHTML)
          breaked = false
          break
        }
      }
      if (breaked) {
        $explorerBody.insertAdjacentHTML('beforeend', data.successHTML)
      }
      fileSet(data.id)
      fileSelect(data.id)
      fileRename(data.id)
    })
    .catch((error) => {
      console.log(error)
    })
}

function folderReload (id) {
  const $folder = document.getElementById(`Folder-${id}`)
  if ($folder.querySelector('.pane-item-children').children.length === 0) {
    removeOpen(id)
    $folder.classList.remove('folder-open')
    $folder.classList.remove('parent-item')
    $folder.classList.add('empty-item')
  } else {
    $folder.classList.add('parent-item')
    $folder.classList.remove('empty-item')
  }
}

function folderReloadElement ($item) {
  const id = $item.id
  if (id.includes('Folder-')) {
    folderReload(id.replace('Folder-', ''))
  }
}

function folderCreateOfExplorer () {
  const csrftoken = getCookie('csrftoken')
  fetch('/api/explorer/folder/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      $explorerBody.insertAdjacentHTML('afterbegin', data.successHTML)
      folderSet(data.id)
      folderRename(data.id)
    })
}

function folderCreate (parentFolderId) {
  const csrftoken = getCookie('csrftoken')
  const data = { id: parentFolderId }
  fetch('/api/folder/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      const $folder = document.getElementById(`Folder-${parentFolderId}`)
      $folder.classList.add('folder-open')
      $folder.querySelector('.pane-item-children').insertAdjacentHTML('afterbegin', data.successHTML)
      folderSet(data.id)
      folderReload(parentFolderId)
      folderRename(data.id)
    })
    .catch((error) => {
      console.log(error)
    })
}

function folderRename (id) {
  const $folder = document.getElementById(`Folder-${id}`)
  resetRename($folder)
}

function folderSet (id) {
  const $folderItem = document.getElementById(`Folder-${id}`)
  const $folderItemHeader = $folderItem.querySelector('.FolderItem-header')

  $folderItemHeader.addEventListener('click', () => {
    if ($folderItem.classList.contains('empty-item')) {
      return
    }
    if ($folderItem.classList.contains('folder-open')) {
      $folderItem.classList.remove('folder-open')
      removeOpen(id)
    } else {
      $folderItem.classList.add('folder-open')
      addOpen(id)
    }
  })
  $folderItemHeader.addEventListener('contextmenu', (event) => {
    $folderContextMenuId.textContent = id
    showContextMenu($folderContextMenu, event.pageX, event.pageY)
  })
  const $folderRename = $folderItemHeader.querySelector('.pane-item-rename')
  $folderRename.addEventListener('submit', (event) => {
    event.preventDefault()
    const csrftoken = getCookie('csrftoken')
    const data = { id, name: $folderRename.querySelector('.pane-item-title').value }
    fetch('/api/folder/', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.message)
          return
        }
        resetRename()
        $folderItemHeader.querySelector('.FolderItem-title').textContent = data.name
      }).catch((error) => {
        console.log(error)
      })
  })
}

function folderDelete (id) {
  const csrftoken = getCookie('csrftoken')
  const data = { id }
  fetch('/api/folder/', {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      const $folder = document.getElementById(`Folder-${id}`)
      const $parent = $folder.parentElement.parentElement
      $folder.remove()
      folderReloadElement($parent)
      checkActiveExisits()
    })
    .catch((error) => {
      console.log(error)
    })
}

function fileRename (id) {
  const $file = document.getElementById(`File-${id}`)
  resetRename($file)
}

function fileSelect (id) {
  const $opendFile = $explorerPane.querySelectorAll('.file-open')
  for (const $openFile of $opendFile) {
    $openFile.classList.remove('file-open')
  }
  const $fileItem = document.getElementById(`File-${id}`)
  $fileItem.classList.add('file-open')
  const csrftoken = getCookie('csrftoken')
  fetch(`/api/file/${id}`, {
    method: 'GET',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      const content = data.content
      document.getElementById('content').value = content
      setActiveFile(id)
      syncPreview(content)
      document.getElementById('markdown').style = 'display:flex'
    })
    .catch((error) => {
      console.log(error)
    })
  window.history.replaceState(null, null, `/markdowns/${id}`)
}

function fileSet (id) {
  const $fileItem = document.getElementById(`File-${id}`)
  const $fileItemHeader = $fileItem.querySelector('.FileItem-header')
  $fileItemHeader.addEventListener('click', () => {
    if ($fileItem.classList.contains('file-open')) {
      // TODO: rename file function
      // WARN: ここが昨日の続き↑
      return
    }
    fileSelect(id)
  })
  $fileItemHeader.addEventListener('contextmenu', (event) => {
    $fileContextMenuId.textContent = id
    showContextMenu($fileContextMenu, event.pageX, event.pageY)
  })
  const $fileRename = $fileItemHeader.querySelector('.pane-item-rename')
  $fileRename.addEventListener('submit', (event) => {
    event.preventDefault()
    const csrftoken = getCookie('csrftoken')
    const data = { id, name: $fileRename.querySelector('.pane-item-title').value, option: 'name' }
    fetch('/api/file/', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.status) {
          console.log(data.message)
          return
        }
        resetRename()
        $fileItemHeader.querySelector('.FileItem-title').textContent = data.name
      }).catch((error) => {
        console.log(error)
      })
  })
}

function fileCreate (parentFolderId) {
  const csrftoken = getCookie('csrftoken')
  const data = { id: parentFolderId }
  fetch('/api/file/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      const $folder = document.getElementById(`Folder-${parentFolderId}`)
      $folder.classList.add('folder-open')
      const $children = $folder.querySelector('.pane-item-children')
      const $childrens = $children.children
      if ($childrens.length === 0) {
        $children.insertAdjacentHTML('afterbegin', data.successHTML)
      } else {
        let breaked = true
        for (const $item of $childrens) {
          if (!$item.classList.contains('FolderItem')) {
            $item.insertAdjacentHTML('beforebegin', data.successHTML)
            breaked = false
            break
          }
        }
        if (breaked) {
          $folder.insertAdjacentHTML('beforeend', data.successHTML)
        }
      }
      fileSet(data.id)
      fileSelect(data.id)
      fileRename(data.id)
      folderReload(parentFolderId)
    })
    .catch((error) => {
      console.log(error)
    })
}

function fileDelete (id) {
  const csrftoken = getCookie('csrftoken')
  const data = { id }
  fetch('/api/file/', {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status) {
        console.log(data.message)
        return
      }
      const $file = document.getElementById(`File-${id}`)
      const $parent = $file.parentElement.parentElement
      $file.remove()
      folderReloadElement($parent)
      checkActiveExisits()
    })
    .catch((error) => {
      console.log(error)
    })
}

loadExplorer(() => {
  for (const id of getOpens()) {
    const $folder = document.getElementById(`Folder-${id}`)
    if ($folder === null) {
      removeOpen(id)
      return
    }
    $folder.classList.add('folder-open')
  }

  if (/markdowns\/([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/.test(window.location.pathname)) {
    setActiveFile(window.location.pathname.replace('/markdowns/', ''))
  }

  if (getActiveFile() !== null) {
    document.getElementById(`File-${getActiveFile()}`).classList.add('file-open')
  }

  $explorerBody.querySelectorAll('.FolderItem').forEach(($folderItem) => {
    const id = $folderItem.id.replace('Folder-', '')
    folderSet(id)
  })

  $explorerBody.querySelectorAll('.FileItem').forEach(($fileItem) => {
    const id = $fileItem.id.replace('File-', '')
    fileSet(id)
  })

  for (const $item of document.querySelectorAll('.pane-item-input')) {
    $item.addEventListener('blur', () => {
      resetRename()
    }, true)
  }
})
