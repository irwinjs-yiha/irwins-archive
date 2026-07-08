// Removes broken/unused options from Decap CMS's Publish button dropdown,
// across every collection, leaving only "Publish now". Neither of these is
// exposed via config.yml, so they're stripped out at the DOM level once
// Decap renders the dropdown.
//
// - "Publish and duplicate": simply not wanted in this project's workflow.
// - "Publish and create new": removed because it's broken in Decap CMS
//   itself — it publishes the current entry successfully, but never clears
//   the form or navigates anywhere, leaving the editor stuck looking at the
//   entry it just published. This is a confirmed upstream bug, unresolved
//   since Netlify CMS 2.10.56: github.com/decaporg/decap-cms/issues/4294
//
// Matching is done by each menu item's visible text, not by Decap's
// generated CSS class names — those are content-hashed
// (e.g. "css-15di80x-button-button-dropdownItem-...") and can change across
// Decap CMS versions/rebuilds, while the `role="menuitem"` attribute and the
// item's label text are stable, semantic, and version-agnostic.
(function () {
  var TARGET_TEXTS = ['Publish and duplicate', 'Publish and create new'];

  function stripFromSubtree(root) {
    var items = root.querySelectorAll ? root.querySelectorAll('[role="menuitem"]') : [];
    for (var i = 0; i < items.length; i++) {
      if (TARGET_TEXTS.indexOf(items[i].textContent.trim()) !== -1) {
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
          TARGET_TEXTS.indexOf(node.textContent.trim()) !== -1
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
