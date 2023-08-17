//
// BLOCK: ContextMenus
let enableContextMenu = null
const $contextMenus = document.querySelector('.ContextMenus')

const resetContextMenu = () => {
  if (enableContextMenu !== null) {
    enableContextMenu.style = 'none'
  }
}

const $fileContextMenu = $contextMenus.querySelector('.FileContextMenu')

const $folderContextMenu = $contextMenus.querySelector('.FolderContextMenu')

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
      console.log(`${event.target.id}ContextMenu`)
      showContextMenu(
        $contextMenus.querySelector(`.${event.target.id}ContextMenu`),
        event.pageX,
        event.pageY
      )
    }
  })
})

// BLOCK: ModalMenus

const $modalMenus = document.querySelector('.ModalMenus')

$modalMenus.querySelectorAll('.ModalMenu').forEach(($modalMenu) => {
  $modalMenu.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      $modalMenu.style.display = 'none'
    }
  })
  const $ModalMenuClose = $modalMenu.querySelector('.ModalMenu-close')
  if ($ModalMenuClose !== null) {
    $ModalMenuClose.addEventListener('click', () => {
      $modalMenu.style.display = 'none'
    })
  }
})

const $FileRenameModalMenu = $modalMenus.querySelector('.FileRenameModalMenu')

function showModalMenuOfFileRename (fileID, name, x, y) {
  $FileRenameModalMenu.style.display = 'block'
  $FileRenameModalMenu.style.left = `${x}px`
  $FileRenameModalMenu.style.top = `${y - 50}px`
  const $name = $FileRenameModalMenu.querySelector('#FileRenameModalMenu-name')
  $name.value = name
  $name.focus()
  $FileRenameModalMenu.querySelector('#FileRenameModalMenu-id').value = fileID
}

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

const opens = getOpens()
for (let index = 0; index < opens.length; index++) {
  const id = opens[index]
  const $folderItem = document.getElementById(`Folder-${id}`)
  $folderItem.classList.add('folder-open')
  const $folderChildren = $folderItem.querySelector('.pane-item-children')
  $folderChildren.style.display = 'block'
}

$explorerPane.querySelectorAll('.FolderItem').forEach(($folderItem) => {
  const $folderItemHeader = $folderItem.querySelector('.FolderItem-header')
  const $folderChildren = $folderItem.querySelector('.pane-item-children')
  $folderItemHeader.addEventListener('click', () => {
    if ($folderItem.classList.contains('empty-item')) {
      return
    }
    const id = Number($folderItem.id.replace('Folder-', ''))
    if ($folderItem.classList.contains('folder-open')) {
      $folderItem.classList.remove('folder-open')
      $folderChildren.style.display = 'none'
      removeOpen(id)
    } else {
      $folderItem.classList.add('folder-open')
      $folderChildren.style.display = 'block'
      addOpen(id)
    }
  })
  $folderItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($folderContextMenu, event.pageX, event.pageY)
  })
})

$explorerPane.querySelectorAll('.FileItem').forEach(($fileItem) => {
  const $fileItemHeader = $fileItem.querySelector('.FileItem-header')
  // NOTE: ここでファイルを開く
  $fileItemHeader.addEventListener('click', () => {
    const id = $fileItem.id.replace('File-', '')
    if ($fileItem.classList.contains('file-open')) {
      const rect = $fileItem.getBoundingClientRect()
      showModalMenuOfFileRename(
        id,
        $fileItemHeader.querySelector('.FileItem-title').textContent,
        rect.x,
        rect.y
      )
      // NOTE: edit name
      return
    }
    const $opendFile = $explorerPane.getElementsByClassName('file-open')
    if ($opendFile.length !== 0) {
      const $openFile = $opendFile[0]
      $openFile.classList.remove('file-open')
    }
    $fileItem.classList.add('file-open')
    window.location.href = `/markdowns/${id}`
    // NOTE: redirect file preview and editor
  })
  $fileItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($fileContextMenu, event.pageX, event.pageY)
  })
})
