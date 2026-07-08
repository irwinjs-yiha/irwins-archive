// Turns Decap CMS's Publish dropdown into a single, direct "publish" click,
// across every collection. None of this is exposed via config.yml, so it's
// done at the DOM level once Decap renders the button/menu.
//
// Background: Decap's Publish control is always a dropdown (a single
// `[aria-haspopup="true"]` element — the arrow is just a CSS ::after icon on
// that same element, not a separate button). It originally listed three
// options:
//   - "Publish now" — the one action anyone actually wants.
//   - "Publish and duplicate" — not wanted in this project's workflow.
//   - "Publish and create new" — confirmed broken in Decap CMS itself: it
//     publishes the current entry successfully, but never clears the form
//     or navigates anywhere, leaving the editor stuck looking at the entry
//     it just published. Unresolved upstream bug since Netlify CMS 2.10.56:
//     github.com/decaporg/decap-cms/issues/4294
//
// Rather than just removing the two unwanted items (which still leaves a
// dropdown with one pointless item requiring two clicks), this script:
//   1. Removes "Publish and duplicate" / "Publish and create new" if they
//      ever render (defense in depth — they're not in config.yml either).
//   2. Auto-clicks "Publish now" the instant it renders, so opening the
//      dropdown and choosing the only real option happens in one motion —
//      from the user's perspective, one click just publishes.
//   3. Hides the dropdown's caret icon via CSS, so the button no longer
//      visually implies there's a menu to open.
//
// Matching is done by each menu item's visible text and by the
// `role="menuitem"` / `aria-haspopup` attributes — not by Decap's generated
// CSS class names, which are content-hashed (e.g.
// "css-15di80x-button-button-dropdownItem-...") and can change across
// Decap CMS versions/rebuilds. Text content and ARIA roles are stable and
// version-agnostic.
(function () {
  var REMOVE_TEXTS = ['Publish and duplicate', 'Publish and create new'];
  var AUTO_CLICK_TEXT = 'Publish now';

  // Hide the dropdown caret icon (a CSS ::after on the aria-haspopup element).
  var style = document.createElement('style');
  style.textContent = '[aria-haspopup="true"]::after { display: none !important; }';
  document.head.appendChild(style);

  function handleMenuItem(item) {
    var text = item.textContent.trim();
    if (REMOVE_TEXTS.indexOf(text) !== -1) {
      item.remove();
    } else if (text === AUTO_CLICK_TEXT) {
      item.click();
    }
  }

  function scanSubtree(root) {
    var items = root.querySelectorAll ? root.querySelectorAll('[role="menuitem"]') : [];
    for (var i = 0; i < items.length; i++) {
      handleMenuItem(items[i]);
    }
  }

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue; // only element nodes
        if (node.matches && node.matches('[role="menuitem"]')) {
          handleMenuItem(node);
          continue;
        }
        scanSubtree(node);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
