// Custom Decap CMS widget: search TMDB and autofill the film entry form.
// Registered on the "poster" field (see admin/config.yml) so its own value
// (the poster URL) is set the normal, supported way via onChange. Because
// Decap's widget API only lets a control update its own field, the sibling
// fields (title, year, director, cast) are synced by locating their inputs
// via their configured label text and dispatching native input events so
// React picks up the change — the standard workaround for cross-field
// autofill in Decap/Netlify CMS.
(function () {
  var FUNCTION_ENDPOINT = '/.netlify/functions/tmdb-search';
  var SEARCH_DEBOUNCE_MS = 450;

  function setNativeValue(el, value) {
    if (!el) return;
    var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    var descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Finds a field's <input>/<textarea> by matching the visible <label> text
  // configured in admin/config.yml (e.g. "Movie Title", "Year Released").
  function findFieldInput(labelText) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      var lbl = labels[i];
      var text = (lbl.textContent || '').trim();
      if (text.indexOf(labelText) === 0) {
        var forId = lbl.getAttribute('for');
        if (forId) {
          var byId = document.getElementById(forId);
          if (byId) return byId;
        }
        var container = lbl.parentElement;
        var hops = 0;
        while (container && hops < 4) {
          var input = container.querySelector('input, textarea');
          if (input) return input;
          container = container.parentElement;
          hops++;
        }
      }
    }
    return null;
  }

  function autofillSiblingFields(details) {
    var titleInput = findFieldInput('Movie Title');
    var yearInput = findFieldInput('Year Released');
    var directorInput = findFieldInput('Director');
    var castInput = findFieldInput('Cast');

    if (titleInput) setNativeValue(titleInput, details.title || '');
    if (yearInput) setNativeValue(yearInput, details.year || '');
    if (directorInput) setNativeValue(directorInput, details.director || '');
    if (castInput) setNativeValue(castInput, (details.cast || []).join(', '));
  }

  function fetchJSON(url) {
    return fetch(url).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data && data.error ? data.error : 'Request failed (' + res.status + ').');
        }
        return data;
      });
    });
  }

  var TmdbSearchControl = createClass({
    getInitialState: function () {
      return { query: '', results: [], loading: false, detailLoading: false, error: null };
    },

    componentWillUnmount: function () {
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
    },

    handleQueryChange: function (e) {
      var query = e.target.value;
      var self = this;
      this.setState({ query: query, error: null });

      if (this._debounceTimer) clearTimeout(this._debounceTimer);

      if (!query || query.trim().length < 2) {
        this.setState({ results: [] });
        return;
      }

      this._debounceTimer = setTimeout(function () {
        self.runSearch(query);
      }, SEARCH_DEBOUNCE_MS);
    },

    runSearch: function (query) {
      var self = this;
      this.setState({ loading: true, error: null });
      fetchJSON(FUNCTION_ENDPOINT + '?query=' + encodeURIComponent(query))
        .then(function (data) {
          self.setState({ results: data.results || [], loading: false });
        })
        .catch(function (err) {
          self.setState({ error: err.message, loading: false, results: [] });
        });
    },

    handleSelect: function (movieId) {
      var self = this;
      this.setState({ detailLoading: true, error: null });
      fetchJSON(FUNCTION_ENDPOINT + '?movieId=' + encodeURIComponent(movieId))
        .then(function (details) {
          self.props.onChange(details.poster || '');
          autofillSiblingFields(details);
          self.setState({ detailLoading: false, results: [], query: details.title || '' });
        })
        .catch(function (err) {
          self.setState({ error: err.message, detailLoading: false });
        });
    },

    handlePosterUrlChange: function (e) {
      this.props.onChange(e.target.value);
    },

    render: function () {
      var self = this;
      var value = this.props.value || '';

      return h(
        'div',
        { className: 'tmdb-search-widget', style: { border: '1px solid #cfcfcf', borderRadius: 4, padding: 12 } },
        h('input', {
          type: 'text',
          placeholder: 'Search TMDB for a movie title…',
          value: this.state.query,
          onChange: this.handleQueryChange,
          style: { width: '100%', padding: 8, fontSize: 15, boxSizing: 'border-box', marginBottom: 8 },
        }),
        this.state.loading ? h('div', { style: { fontSize: 13, color: '#777', marginBottom: 8 } }, 'Searching…') : null,
        this.state.error ? h('div', { style: { fontSize: 13, color: '#c0392b', marginBottom: 8 } }, this.state.error) : null,
        this.state.results.length > 0
          ? h(
              'div',
              { style: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10, maxHeight: 320, overflowY: 'auto' } },
              this.state.results.map(function (movie) {
                return h(
                  'div',
                  {
                    key: movie.id,
                    onClick: function () {
                      self.handleSelect(movie.id);
                    },
                    style: { width: 90, cursor: 'pointer', textAlign: 'center' },
                  },
                  movie.posterPath
                    ? h('img', { src: movie.posterPath, style: { width: '100%', borderRadius: 3, display: 'block' } })
                    : h('div', { style: { width: '100%', height: 135, background: '#eee', borderRadius: 3 } }),
                  h('div', { style: { fontSize: 11, marginTop: 4, lineHeight: 1.3 } }, movie.title),
                  h('div', { style: { fontSize: 10, color: '#888' } }, movie.year || '')
                );
              })
            )
          : null,
        this.state.detailLoading ? h('div', { style: { fontSize: 13, color: '#777', marginBottom: 8 } }, 'Loading details…') : null,
        h('label', { style: { fontSize: 12, color: '#666', display: 'block', marginBottom: 4 } }, 'Poster URL (auto-filled, or paste your own)'),
        h('input', {
          type: 'text',
          value: value,
          onChange: this.handlePosterUrlChange,
          style: { width: '100%', padding: 8, fontSize: 13, boxSizing: 'border-box', marginBottom: value ? 8 : 0 },
        }),
        value ? h('img', { src: value, style: { maxWidth: 140, display: 'block', borderRadius: 3 } }) : null
      );
    },
  });

  var TmdbSearchPreview = createClass({
    render: function () {
      var value = this.props.value;
      if (!value) return h('div', {}, 'No poster selected.');
      return h('img', { src: value, style: { maxWidth: 200 } });
    },
  });

  CMS.registerWidget('tmdb-search', TmdbSearchControl, TmdbSearchPreview);
})();
