// BLOCK: ContextMenus
let enableContextMenu = null
const $contextMenus = document.querySelector('.ContextMenus')

const resetContextMenu = () => {
  if (enableContextMenu !== null) {
    enableContextMenu.style = 'none'
  }
}

const $documentContextMenu = $contextMenus.querySelector(
  '.DocumentContextMenu'
)

const $folderContextMenu = $contextMenus.querySelector('.FolderContextMenu')

function showContextMenu (contextMenu, x, y) {
  resetContextMenu()
  enableContextMenu = contextMenu
  contextMenu.style.display = 'block'
  contextMenu.style.left = x + 'px'
  contextMenu.style.top = y + 'px'
}

document.addEventListener('click', () => {
  resetContextMenu()
})

const $Panes = document.getElementsByClassName('PaneBody')
for (let i = 0; i < $Panes.length; i++) {
  const $Pane = $Panes[i]
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
}

// BLOCK: ModalMenus
const $modalMenus = document.querySelector('.ModalMenus')

const $allModalMenu = $modalMenus.getElementsByClassName('ModalMenu')
for (let i = 0; i < $allModalMenu.length; i++) {
  const $modalMenu = $allModalMenu[i]
  $modalMenu.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      $modalMenu.style.display = 'none'
    }
  })
  const $ModalMenuClose = $modalMenu.querySelector('.ModalMenu-close')
  if ($ModalMenuClose === null) {
    continue
  }
  $ModalMenuClose.addEventListener('click', () => {
    $modalMenu.style.display = 'none'
  })
}

const $DocumentRenameModalMenu = $modalMenus.querySelector(
  '.DocumentRenameModalMenu'
)

function showModalMenuOfDocumentRename (documentID, name, x, y) {
  $DocumentRenameModalMenu.style.display = 'block'
  $DocumentRenameModalMenu.style.left = x + 'px'
  $DocumentRenameModalMenu.style.top = y - 50 + 'px'
  const $name = $DocumentRenameModalMenu.querySelector(
    '#DocumentRenameModalMenu-name'
  )
  $name.value = name
  $name.focus()
  $DocumentRenameModalMenu.querySelector('#DocumentRenameModalMenu-id').value =
    documentID
}

// BLOCK: Explorer Pane
const $explorerPane = document.getElementById('explorer')
const $folderItems = $explorerPane.getElementsByClassName('FolderItem')
const $documentItems = $explorerPane.getElementsByClassName('DocumentItem')

for (let i = 0; i < $folderItems.length; i++) {
  const $folderItem = $folderItems[i]
  const $folderItemHeader = $folderItem.querySelector('.FolderItem-header')
  const $folderChildren = $folderItem.querySelector('.pane-item-children')
  $folderItemHeader.addEventListener('click', () => {
    if ($folderItem.classList.contains('empty-item')) {
      return
    }
    if ($folderItem.classList.contains('folder-open')) {
      $folderItem.classList.remove('folder-open')
      $folderChildren.style.display = 'none'
    } else {
      $folderItem.classList.add('folder-open')
      $folderChildren.style.display = 'block'
    }
  })
  $folderItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($folderContextMenu, event.pageX, event.pageY)
  })
}

for (let i = 0; i < $documentItems.length; i++) {
  const $documentItem = $documentItems[i]
  const $documentItemHeader = $documentItem.querySelector(
    '.DocumentItem-header'
  )
  // NOTE: ここでファイルを開く
  $documentItemHeader.addEventListener('click', () => {
    if ($documentItem.classList.contains('file-open')) {
      const rect = $documentItem.getBoundingClientRect()
      showModalMenuOfDocumentRename(
        $documentItem.id.replace('Document-', ''),
        $documentItemHeader.querySelector('.DocumentItem-title').textContent,
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
    $documentItem.classList.add('file-open')
    // NOTE: redirect file preview and editor
  })
  $documentItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($documentContextMenu, event.pageX, event.pageY)
  })
}
