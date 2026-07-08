// Removes Decap CMS's built-in "Publish and duplicate" option from the
// Publish button's dropdown, across every collection. This option isn't
// exposed via config.yml, so it's stripped out at the DOM level once Decap
// renders the dropdown.
//
// Matching is done by the menu item's visible text ("Publish and duplicate"),
// not by Decap's generated CSS class names — those are content-hashed
// (e.g. "css-15di80x-button-button-dropdownItem-...") and can change across
// Decap CMS versions/rebuilds, while the `role="menuitem"` attribute and the
// item's label text are stable, semantic, and version-agnostic.
(function () {
  var TARGET_TEXT = 'Publish and duplicate';

  function stripFromSubtree(root) {
    var items = root.querySelectorAll ? root.querySelectorAll('[role="menuitem"]') : [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].textContent.trim() === TARGET_TEXT) {
        items[i].remove();
      }
    }
  }

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue; // only element nodes
        if (
          node.matches &&
          node.matches('[role="menuitem"]') &&
          node.textContent.trim() === TARGET_TEXT
        ) {
          node.remove();
          continue;
        }
        stripFromSubtree(node);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
