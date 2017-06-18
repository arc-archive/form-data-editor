[![Build Status](https://travis-ci.org/advanced-rest-client/form-data-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/form-data-editor)  

# form-data-editor

An element to edit form data (x-www-form-urlencoded).

The element renders a form of body properties. Each row contains name and value input fields to
describe parameters in body.
Empty values for both name and value inputs are not included in final body value.

### Example

```
<form-data-editor></form-data-editor>
```

The element contains encode and decode values buttons so the user can choose if and when to
decode / encode the value. If `autoEncode` property is set (the `auto-encode` attribute) then this
task will be handled automatically. However it may cause problems for the user in some cases (when,
for example the user paste already encoded value to the input field it will be encoded again).

### Example

```html
<form-data-editor auto-encode value="{{payload}}"></form-data-editor>
```

### Prohibit element from computing values

The element will compute it's internal model every time the value change. Sometimes you may want to
use this element alongside other payload editors. In this case, if the element is still in the DOM
and accepts value change, you may wish to prohibit any computations if other element is handling
payload edits. To do so, set `attrForOpened` property to an attribute name that will be set when
the element should process inputs. If this attribute is not set, then computations will be halted.

Value for `attrForOpened` can be any name that is not already used by the element in the properties
list.

### Example

```html
<form-data-editor attr-for-opened="enabled"></form-data-editor>

<script>
  function enableEditor() {
    document.querySelector('form-data-editor').setAttribute('enabled', true);
  }
</script>
```

Note, it will only work if you set an attribute. It will not handle property change.

### Styling
`<form-data-editor>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--form-data-editor` | Mixin applied to the element | `{}`
`--form-data-editor-row` | Mixin applied to form rows | `{}`
`--form-data-editor-name-input` | Mixin applied to name input container | `{}`
`--form-data-editor-value-input` | Mixin applied to value input container | `{}`
`--form-data-editor-encode-buttons` | Mixin applied to encode / decode buttons container | `{}`
`--action-button` | Theme mixin, applied to the "add parameter" button | `{}`
`--form-data-editor-add-button` | Mixin applied to the "add parameter" button | `{}`
`--form-data-editor-add-button-background-color` | Background color of the "add parameter" button | `--primary-color`
`--form-data-editor-add-button-color` | Font color of the "add parameter" button | `--primary-background-color`
`--from-row-action-icon-color` | Delete parameter button color | `--icon-button-color` or `rgba(0, 0, 0, 0.74)`
`--from-row-action-icon-color-hover` | Delete parameter button color when hovering with the pointer | `--accent-color` or `rgba(0, 0, 0, 0.74)`



### Events
| Name | Description | Params |
| --- | --- | --- |
| payload-value-changed | Event fire when the value of the editor change. This event is not fired if `attrForOpened` is set and corresponding value is not set. | value **String** - Current payload value. |
