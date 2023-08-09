const $folderItems = document.getElementsByClassName('FolderItem')
const $documentItems = document.getElementsByClassName('DocumentItem')

// BLOCK : ContextMenus
let enableContextMenu = null
const $documentContextMenu = document.getElementsByClassName(
  'DocumentContextMenu'
)[0]
const $folderContextMenu =
  document.getElementsByClassName('FolderContextMenu')[0]
document.getElementsByTagName('main')[0].addEventListener('click', () => {
  if (enableContextMenu !== null) {
    enableContextMenu.style = 'none'
  }
})

function showContextMenu (contextMenu, x, y) {
  if (enableContextMenu !== null) {
    enableContextMenu.style.display = 'none'
  }
  enableContextMenu = contextMenu
  contextMenu.style.display = 'block'
  contextMenu.style.left = x + 'px'
  contextMenu.style.top = y + 'px'
}

const $Panes = document.getElementsByClassName('Pane')
for (let i = 0; i < $Panes.length; i++) {
  const $Pane = $Panes[i]
  $Pane.addEventListener('contextmenu', (event) => {
    if (event.target === event.currentTarget) {
      showContextMenu($folderContextMenu, event.pageX, event.pageY)
    }
  })
}

for (let i = 0; i < $folderItems.length; i++) {
  const $folderItem = $folderItems[i]
  const $folderItemHeader =
    $folderItem.getElementsByClassName('FolderItem-header')[0]
  const $folderChildren =
    $folderItem.getElementsByClassName('pane-item-children')[0]
  $folderItemHeader.addEventListener('click', () => {
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
  const $documentItemHeader = $documentItem.getElementsByClassName(
    'DocumentItem-header'
  )[0]
  // NOTE : ここでファイルを開く
  $documentItemHeader.addEventListener('click', () => {
    if ($documentItem.classList.contains('file-open')) {
      $documentItem.classList.remove('file-open')
    } else {
      $documentItem.classList.add('file-open')
    }
  })
  $documentItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($documentContextMenu, event.pageX, event.pageY)
  })
}
