function applyClassElements (className, elementLambda) {
  const $clazz = document.getElementsByClassName(className)
  for (let i = 0; i < $clazz.length; i++) {
    elementLambda($clazz[i])
  }
}

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

applyClassElements('PaneBody', ($Pane) => {
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

applyClassElements('ModalMenu', ($modalMenu) => {
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
  $FileRenameModalMenu.querySelector('#fileRenameModalMenu-id').value = fileID
}

// BLOCK: Explorer Pane
const $LeftPane = document.querySelector('.LeftPaneContainer')
const $explorerPane = document.getElementById('explorer')

applyClassElements('explorer-toggle', ($toggle) => {
  $toggle.addEventListener('click', () => {
    if ($LeftPane.style.display === 'block') {
      $LeftPane.style.display = 'none'
    } else {
      $LeftPane.style.display = 'block'
    }
  })
})

applyClassElements('explorer-close', ($close) => {
  $close.addEventListener('click', () => {
    $LeftPane.style.display = 'none'
  })
})

applyClassElements('explorer-open', ($open) => {
  $open.addEventListener('click', () => {
    $LeftPane.style.display = 'block'
  })
})

applyClassElements('FolderItem', ($folderItem) => {
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
})

applyClassElements('FileItem', ($fileItem) => {
  const $fileItemHeader = $fileItem.querySelector('.FileItem-header')
  // NOTE: ここでファイルを開く
  $fileItemHeader.addEventListener('click', () => {
    if ($fileItem.classList.contains('file-open')) {
      const rect = $fileItem.getBoundingClientRect()
      showModalMenuOfFileRename(
        $fileItem.id.replace('File-', ''),
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
    // NOTE: redirect file preview and editor
  })
  $fileItemHeader.addEventListener('contextmenu', (event) => {
    showContextMenu($fileContextMenu, event.pageX, event.pageY)
  })
})
