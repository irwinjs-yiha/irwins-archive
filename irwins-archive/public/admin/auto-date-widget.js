// Custom Decap CMS widget: silently stamps a field with the current date/time
// the moment a new entry is opened, without showing any UI.
//
// Why this exists: Decap's built-in "hidden" widget only supports a *literal*
// default value — it does NOT resolve the "{{now}}" template tag (that
// resolution only happens inside the "datetime" widget's own save path). Using
// `{ widget: "hidden", default: "{{now}}" }` writes the literal string
// "{{now}}" into the frontmatter on every new entry, which then fails Zod's
// z.coerce.date() validation at build time. Confirmed against Decap's own
// docs (decapcms.org/docs/widgets/hidden) and a matching unresolved report
// (github.com/decaporg/decap-cms/discussions/7425) — there is no supported
// config-only fix for this.
//
// This widget renders nothing visible (so it behaves like "hidden" from the
// editor's point of view) but sets a real, valid ISO date string via
// componentDidMount if the field doesn't already have a value, using the
// same onChange path Decap already validates against the field's widget.
(function () {
  var AutoDateControl = createClass({
    componentDidMount: function () {
      if (!this.props.value) {
        this.props.onChange(new Date().toISOString());
      }
    },
    render: function () {
      // No UI — matches the "hidden" widget's zero UI footprint.
      return null;
    },
  });

  var AutoDatePreview = createClass({
    render: function () {
      return null;
    },
  });

  CMS.registerWidget('auto-date', AutoDateControl, AutoDatePreview);
})();
