function isNotNone(object, process) {
  if (object) {
    if (process) {
      process(object)
    }
    return true
  }
  return false
}

class Ajax {
  constructor(url, method = 'GET') {
    this.url = url
    this.method = method
    this.headers = {
      'X-CSRFToken': getCookie('csrftoken'),
      'Content-Type': 'application/json'
    }
    this.body = this.method === 'GET' ? null : {}
    this.serializer = (response) => response.json()
    this.success = null
    this.statusOk = null
    this.statusNo = (data) => {
      if (data.message) {
        console.log(data.message)
      }
    }
    this.error = (error) => {
      console.log(error)
    }
    this.finally = null
  }

  addHeaers(properties) {
    Object.assign(this.headers, properties)
    return this
  }

  setBody(body) {
    this.body = body
    return this
  }

  setSerializer(serializer) {
    this.serializer = serializer
    return this
  }

  setSuccess(success) {
    this.success = success
    return this
  }

  setStatusOk(ok) {
    this.statusOk = ok
    return this
  }

  setStatusNo(no) {
    this.statusNo = no
    return this
  }

  setError(error) {
    this.error = error
    return this
  }

  async run() {
    const property = {
      method: this.method,
      headers: this.headers
    }
    if (this.body !== null) {
      Object.assign(property, { body: JSON.stringify(this.body) })
    }
    await fetch(this.url, property)
      .then((response) => this.serializer(response))
      .then((data) => {
        if (this.success) {
          this.success(data)
          return
        }
        isNotNone(data.status ? this.statusOk : this.statusNo, (func) =>
          func(data)
        )
      })
      .catch((error) => {
        if (this.error) {
          this.error(error)
        }
      })
      .finally(() => {
        if (this.finally) {
          this.finally()
        }
      })
  }
}

function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

const UrlDomain = window.location.protocol + '//' + window.location.host + '/'

document.getElementById('UrlDomain').textContent = UrlDomain

const $explorerBody = document.getElementById('ExplorerBody')

function loadExplorer(success = null) {
  new Ajax('/api/explorer/')
    .setSerializer((response) => response.text())
    .setSuccess((data) => {
      $explorerBody.innerHTML = data
      isNotNone(success, (func) => func())
    })
    .setError((error) => {
      console.log(error)
    })
    .run()
}

function setActiveFile(id) {
  localStorage.setItem('activeItem', id)
}

function removeActiveFile() {
  localStorage.removeItem('activeItem')
}

function getActiveFile() {
  return localStorage.getItem('activeItem')
}

function checkActiveExisits() {
  if (getFileOfId(getActiveFile()) === null) {
    removeActiveFile()
    document.getElementById('markdown').style = 'display:none'
    window.history.replaceState(null, null, '/markdowns/')
  }
}

const $markdownBody = document.querySelector('.markdown-body')
const $content = document.getElementById('content')

async function syncPreview(content) {
  new Ajax('/api/markdown/', 'POST')
    .setBody({ content })
    .setSerializer((response) => response.text())
    .setSuccess((data) => {
      $markdownBody.innerHTML = data
    })
    .run()
}

$content.addEventListener('change', (event) => {
  const $file = event.currentTarget
  const data = { id: getActiveFile(), body: $file.value, option: 'content' }
  new Ajax('/api/file/', 'PUT').setBody(data).run()
})

$content.addEventListener('input', (event) => {
  syncPreview(event.currentTarget.value)
})

$content.onkeydown = (e) => {
  if (e.code !== 'Tab') {
    return
  }
  e.preventDefault()
  const newPos = $content.selectionStart + 1
  const value = $content.value
  const head = value.slice(0, $content.selectionStart)
  const foot = value.slice($content.selectionEnd)
  $content.value = head + '\t' + foot
  $content.setSelectionRange(newPos, newPos)
}

if (window.location.pathname === '/markdowns/' && getActiveFile() !== null) {
  new Ajax(`/api/file/${getActiveFile()}`)
    .setStatusOk(() => {
      window.location.pathname = '/markdowns/' + getActiveFile()
    })
    .setStatusNo(() => {
      removeActiveFile()
    })
    .run()
}

$content.addEventListener('scroll', () => {
  const fileBody = $content.scrollHeight - 910
  const fileParseint = $content.scrollTop / fileBody
  const markdownBody = $markdownBody.scrollHeight - 910
  $markdownBody.scrollTop = markdownBody * fileParseint
})

function setOpens(ids) {
  localStorage.setItem('openFolders', JSON.stringify({ ids }))
}

if (localStorage.getItem('openFolders') === null) {
  setOpens([])
}

function getOpens() {
  return JSON.parse(localStorage.getItem('openFolders')).ids
}

function containOpen(id) {
  return getOpens().includes(id)
}

function addOpen(id) {
  if (containOpen(id)) {
    return
  }
  setOpens([...getOpens(), id])
}

function removeOpen(id) {
  if (!containOpen(id)) {
    return
  }
  setOpens(getOpens().filter((i) => i !== id))
}

// BLOCK: ContextMenus
let enableContextMenu = null
const $contextMenus = document.querySelector('.ContextMenus')

const resetContextMenu = () => {
  if (enableContextMenu !== null) {
    enableContextMenu.style = 'none'
  }
}

const $explorerContextMenu = $contextMenus.querySelector(
  '.ExplorerBodyContextMenu'
)

$explorerContextMenu
  .querySelector('.ContextMenuItem--explorerNewFile')
  .addEventListener('click', () => {
    fileCreateOfExplorer()
  })

$explorerContextMenu
  .querySelector('.ContextMenuItem--explorerNewFolder')
  .addEventListener('click', () => {
    folderCreateOfExplorer()
  })

const $fileContextMenu = $contextMenus.querySelector('.FileContextMenu')
const $fileContextMenuId = $fileContextMenu.querySelector('.fileId')

$fileContextMenu
  .querySelector('.ContextMenuItem--fileCopy')
  .addEventListener('click', () => {
    fileCopy($fileContextMenuId.textContent)
  })

$fileContextMenu
  .querySelector('.ContextMenuItem--fileDelete')
  .addEventListener('click', () => {
    fileDelete($fileContextMenuId.textContent)
  })

$fileContextMenu
  .querySelector('.ContextMenuItem--filePublish')
  .addEventListener('click', () => {
    filePublish($fileContextMenuId.textContent)
  })

$fileContextMenu
  .querySelector('.ContextMenuItem--fileRename')
  .addEventListener('click', () => {
    setRename(getFileOfId($fileContextMenuId.textContent))
  })

const $folderContextMenu = $contextMenus.querySelector('.FolderContextMenu')

const $folderContextMenuId = $folderContextMenu.querySelector('.folderId')

$folderContextMenu
  .querySelector('.ContextMenuItem--newFile')
  .addEventListener('click', () => {
    fileCreate($folderContextMenuId.textContent)
  })

$folderContextMenu
  .querySelector('.ContextMenuItem--newFolder')
  .addEventListener('click', () => {
    folderCreate($folderContextMenuId.textContent)
  })

$folderContextMenu
  .querySelector('.ContextMenuItem--folderDelete')
  .addEventListener('click', () => {
    folderDelete($folderContextMenuId.textContent)
  })

$folderContextMenu
  .querySelector('.ContextMenuItem--folderRename')
  .addEventListener('click', () => {
    setRename(getFolderOfId($folderContextMenuId.textContent))
  })

function showContextMenu(contextMenu, x, y) {
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

function isFile(element) {
  return element.id.startsWith('File-')
}

function isFolder(element) {
  return element.id.startsWith('Folder-')
}

function getFileId(fileElement) {
  return fileElement.id.replace('File-', '')
}

function getFolderId(folderElement) {
  return folderElement.id.replace('Folder-', '')
}

function getFileOfId(id) {
  return document.getElementById(`File-${id}`)
}

function getFolderOfId(id) {
  return document.getElementById(`Folder-${id}`)
}

function insertFileHtml($rootElement, fileHtml) {
  let notBreaked = true
  const $children = $rootElement.children
  for (let index = 0; index < $children.length; index++) {
    const $child = $children[index]
    if (isFolder($child)) {
      continue
    }
    $child.insertAdjacentHTML('beforebegin', fileHtml)
    notBreaked = false
    break
  }

  if (notBreaked) {
    $rootElement.insertAdjacentHTML('beforeend', fileHtml)
  }
}

function folderCreateOfExplorer() {
  new Ajax('/api/explorer/folder/', 'POST')
    .setStatusOk((data) => {
      $explorerBody.insertAdjacentHTML('afterbegin', data.successHTML)
      folderSet(data.id)
      setRename(getFolderOfId(data.id))
    })
    .run()
}

function fileCreateOfExplorer() {
  new Ajax('/api/explorer/file/', 'POST')
    .setStatusOk((data) => {
      insertFileHtml($explorerBody, data.successHTML)
      fileSet(data.id)
      fileSelect(data.id)
      setRename(getFileOfId(data.id))
    })
    .run()
}

function folderReload(id) {
  const $folder = getFolderOfId(id)
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

function folderReloadElement($item) {
  const id = $item.id
  if (id.includes('Folder-')) {
    folderReload(id.replace('Folder-', ''))
  }
}

function folderCreate(parentFolderId) {
  new Ajax('/api/folder/', 'POST')
    .setBody({ id: parentFolderId })
    .setStatusOk((data) => {
      const $folder = getFolderOfId(parentFolderId)
      $folder.classList.add('folder-open')
      $folder
        .querySelector('.pane-item-children')
        .insertAdjacentHTML('afterbegin', data.successHTML)
      folderSet(data.id)
      folderReload(parentFolderId)
      setRename(getFolderOfId(data.id))
    })
    .run()
}

let $renameElement = null
function setRename($newRename = null) {
  if ($renameElement !== null) {
    isNotNone(document.getElementById('RenameInput'), (elem) => elem.remove())
    $renameElement.classList.remove('rename-item')
    $renameElement = null
  }
  if ($newRename === null) {
    return
  }
  $newRename.classList.add('rename-item')
  const $header = $newRename.querySelector('.pane-item-header')
  $header.insertAdjacentHTML(
    'beforeend',
    '<input id="RenameInput" class="pane-item-input" spellcheck="false">'
  )
  const $input = document.getElementById('RenameInput')
  const $title = $newRename.querySelector('.pane-item-title')
  const itFile = isFile($newRename)
  const id = itFile ? getFileId($newRename) : getFolderId($newRename)
  const url = itFile ? 'file' : 'folder'
  $input.value = $title.textContent
  $input.focus()
  $input.select()
  const controller = new AbortController()
  $input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      new Ajax(`/api/${url}/`, 'PUT')
        .setBody({ id, name: $input.value, option: 'name' })
        .setStatusOk((data) => {
          $title.textContent = data.name
          controller.abort()
          setRename()
        })
        .run()
    }
  })
  $input.addEventListener(
    'blur',
    () => {
      setRename()
    },
    { signal: controller.signal }
  )
  $renameElement = $newRename
}

function folderSet(id) {
  const $folderItem = getFolderOfId(id)
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
}

function folderDelete(id) {
  new Ajax('/api/folder/', 'DELETE')
    .setBody({ id })
    .setStatusOk(() => {
      const $folder = getFolderOfId(id)
      const $parent = $folder.parentElement.parentElement
      $folder.remove()
      folderReloadElement($parent)
      checkActiveExisits()
    })
    .run()
}

function fileSelect(id) {
  const $opendFile = $explorerPane.querySelectorAll('.file-open')
  for (const $openFile of $opendFile) {
    $openFile.classList.remove('file-open')
  }
  const $fileItem = getFileOfId(id)
  $fileItem.classList.add('file-open')
  new Ajax(`/api/file/${id}`)
    .setStatusOk((data) => {
      const content = data.content
      document.getElementById('content').value = content
      setActiveFile(id)
      syncPreview(content)
      document.getElementById('markdown').style = 'display:flex'
      window.history.replaceState(null, null, `/markdowns/${id}`)
    })
    .run()
}

function fileSet(id) {
  const $fileItem = getFileOfId(id)
  const $fileItemHeader = $fileItem.querySelector('.FileItem-header')
  $fileItemHeader.addEventListener('click', () => {
    if ($fileItem.classList.contains('rename-item')) {
      return
    }
    if ($fileItem.classList.contains('file-open')) {
      setRename($fileItem)
      return
    }
    fileSelect(id)
  })
  $fileItemHeader.addEventListener('contextmenu', (event) => {
    $fileContextMenuId.textContent = id
    showContextMenu($fileContextMenu, event.pageX, event.pageY)
  })
}

function fileCreate(parentFolderId) {
  new Ajax('/api/file/', 'POST')
    .setBody({ id: parentFolderId })
    .setStatusOk((data) => {
      const $folder = getFolderOfId(parentFolderId)
      $folder.classList.add('folder-open')
      insertFileHtml(
        $folder.querySelector('.pane-item-children'),
        data.successHTML
      )
      fileSet(data.id)
      fileSelect(data.id)
      setRename(getFileOfId(data.id))
      folderReload(parentFolderId)
    })
    .run()
}

function fileDelete(id) {
  new Ajax('/api/file', 'DELETE')
    .setBody({ id })
    .setStatusOk(() => {
      const $file = getFileOfId(id)
      const $parent = $file.parentElement.parentElement
      $file.remove()
      folderReloadElement($parent)
      checkActiveExisits()
    })
    .run()
}

// TODO: add file copy action
function fileCopy(id) {
  const $file = getFileOfId(id)
  const hasParent = $file.parentElement.classList.contains('pane-item-children')
  if (hasParent) {
    console.log('has parent')
  } else {
    new Ajax('/api/explorer/file/', 'POST')
      .setBody({
        name: $file.querySelector('.FileItem-title').textContent + "'s Copy"
      })
      .setStatusOk((data) => {
        $file.insertAdjacentHTML('afterend', data.successHTML)
        fileSet(data.id)
        fileSelect(data.id)
        setRename(getFileOfId(data.id))
      })
      .run()
  }
}

const $managePublish = document.getElementById('Publish')

document.getElementById('PublishClose').addEventListener('click', () => {
  $managePublish.classList.remove('open')
  switchOuter.classList.remove('active')
})

$managePublish.addEventListener('click', (e) => {
  if (e.target === $managePublish) {
    $managePublish.classList.remove('open')
    switchOuter.classList.remove('active')
  }
})

const switchOuter = document.getElementById('PublishSwitchOuter')

switchOuter.addEventListener('click', () => {
  const toggle = !switchOuter.classList.contains('active')
  const id = $managePublish.querySelector('.fileId').textContent
  new Ajax('/api/file/', 'PUT')
    .setBody({ id, option: 'is_published', is_published: toggle })
    .setStatusOk(() => {
      const $file = getFileOfId(id)
      $file.classList.toggle('publish-item')
    })
    .run()
  switchOuter.classList.toggle('active')
})

const $PublishName = document.getElementById('PublishName')
const $PublishFileId = document.getElementById('UrlFileId')

const $UrlCopy = document.getElementById('UrlCopy')
let timerId = 0
$UrlCopy.addEventListener('click', () => {
  navigator.clipboard.writeText(
    UrlDomain + 'publish/' + $PublishFileId.textContent
  )
  $UrlCopy.textContent = 'Copied!'
  clearTimeout(timerId)
  timerId = setTimeout(() => {
    $UrlCopy.textContent = 'Copy Link'
  }, 1200)
})

function filePublish(id) {
  $managePublish.querySelector('.fileId').textContent = id
  $PublishFileId.textContent = id
  $managePublish.classList.add('open')
  new Ajax(`/api/file/${id}?option=is_published`)
    .setStatusOk((data) => {
      if (data.is_published) {
        switchOuter.classList.add('active')
      }
    })
    .run()
  new Ajax(`/api/file/${id}?option=name`)
    .setStatusOk((data) => {
      $PublishName.textContent = data.name
    })
    .run()
}

loadExplorer(() => {
  for (const id of getOpens()) {
    const $folder = getFolderOfId(id)
    if ($folder === null) {
      removeOpen(id)
      return
    }
    $folder.classList.add('folder-open')
  }

  if (
    /markdowns\/([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/.test(
      window.location.pathname
    )
  ) {
    setActiveFile(window.location.pathname.replace('/markdowns/', ''))
  }

  if (getActiveFile() !== null) {
    getFileOfId(getActiveFile()).classList.add('file-open')
  }

  $explorerBody.querySelectorAll('.FolderItem').forEach(($folderItem) => {
    const id = $folderItem.id.replace('Folder-', '')
    folderSet(id)
  })

  $explorerBody.querySelectorAll('.FileItem').forEach(($fileItem) => {
    const id = $fileItem.id.replace('File-', '')
    fileSet(id)
  })
})
