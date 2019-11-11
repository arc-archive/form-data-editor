import { html, render } from 'lit-html';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/api-navigation/api-navigation.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@api-components/raml-aware/raml-aware.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '../form-data-editor.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();

    this.initObservableProperties([
      'mainReadOnly', 'mainDisabled', 'demoOutlined', 'demoCompatibility',
      'narrow', 'allowCustom', 'noDocs', 'payloads', 'mediaTypes',
      'dataViewModel', 'mediaDropdownDisabled', 'mediaListSelected',
      'payloadResult'
    ]);

    this.componentName = 'form-data-editor';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.mediaDropdownDisabled = true;
    this._mainDemoStateHandler = this._mainDemoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._mediaTypeChanged = this._mediaTypeChanged.bind(this);
    this._modelHandler = this._modelHandler.bind(this);
    this._mainValueChanged = this._mainValueChanged.bind(this);
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.setData(selected);
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  setData(id) {
    this.mediaListSelected = undefined;
    const webApi = this.helper._computeWebApi(this.amf);
    const method = this.helper._computeMethodModel(webApi, id);
    const expect = this.helper._computeExpects(method);
    const payloads = this.helper._computePayload(expect);
    this.payloads = payloads;
    this.setupMediaTypes(payloads);
  }

  setupMediaTypes(payloads) {
    const types = payloads.map((item) => {
      return this.helper._getValue(item, this.helper.ns.raml.vocabularies.http + 'mediaType');
    });
    this.mediaTypes = types;
    this.mediaDropdownDisabled = false;
    if (types && types.length === 1) {
      setTimeout(() => {
        this.mediaListSelected = 0;
      });
    }
  }

  _mediaTypeChanged(e) {
    const payload = this.payloads[e.detail.value];
    if (!payload) {
      return;
    }
    const key = this.helper._getAmfKey(this.helper.ns.raml.vocabularies.http + 'schema');
    let schema = this.helper._ensureArray(payload[key])[0];
    schema = this.helper._resolve(schema);
    const pKey = this.helper._getAmfKey(this.helper.ns.w3.shacl.name + 'property');
    const properties = this.helper._ensureArray(schema[pKey]);
    const tr = document.getElementById('transformer');
    tr.amf = this.amf;
    const model = tr.computeViewModel(properties);
    this.dataViewModel = model;
  }

  _mainDemoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.demoOutlined = false;
        this.demoCompatibility = false;
        break;
      case 1:
        this.demoOutlined = true;
        this.demoCompatibility = false;
        break;
      case 2:
        this.demoOutlined = false;
        this.demoCompatibility = true;
        break;
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _mainValueChanged(e) {
    this.payloadResult = e.detail.value;
  }

  _modelHandler(e) {
    this.dataViewModel = e.detail.value;
  }

  _demoTemplate() {
    const {
      mainReadOnly,
      mainDisabled,
      demoStates,
      darkThemeActive,
      demoOutlined,
      demoCompatibility,
      narrow,
      allowCustom,
      noDocs,
      mediaDropdownDisabled,
      mediaListSelected,
      dataViewModel,
      payloadResult
    } = this;
    const mediaTypes = this.mediaTypes || [];
    return html`<section role="main" class="documentation-section">
      <h2>API model demo</h2>
      <p>
        This demo lets you preview the API URL parameters editor element with various
        configuration options.
      </p>

      <section class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">
          <arc-interactive-demo
            .states="${demoStates}"
            @state-chanegd="${this._mainDemoStateHandler}"
            ?dark="${darkThemeActive}"
          >

            <div slot="content">
              <anypoint-dropdown-menu
                ?disabled="${mediaDropdownDisabled}">
                <label slot="label">Select media type</label>
                <anypoint-listbox
                  slot="dropdown-content"
                  .selected="${mediaListSelected}"
                  @selected-changed="${this._mediaTypeChanged}">
                  ${mediaTypes.map((item) => html`<anypoint-item data-type="${item}">${item}</anypoint-item>`)}
                </anypoint-listbox>
              </anypoint-dropdown-menu>

              <form-data-editor
                ?readonly="${mainReadOnly}"
                ?disabled="${mainDisabled}"
                ?outlined="${demoOutlined}"
                ?compatibility="${demoCompatibility}"
                .model="${dataViewModel}"
                .narrow="${narrow}"
                .allowCustom="${allowCustom}"
                .noDocs="${noDocs}"
                allowdisableparams
                allowhideoptional
                @value-changed="${this._mainValueChanged}"
                @model-changed="${this._modelHandler}"></form-data-editor>
            </div>

            <label slot="options" id="mainOptionsLabel">Options</label>

            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="mainReadOnly"
              @change="${this._toggleMainOption}"
              >Read only</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="mainDisabled"
              @change="${this._toggleMainOption}"
              >Disabled</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="narrow"
              @change="${this._toggleMainOption}"
              >Narrow view</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="noDocs"
              @change="${this._toggleMainOption}"
              >No docs</anypoint-checkbox
            >
            <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="demoCompatibility"
            @change="${this._toggleMainOption}"
            >Compatibility</anypoint-checkbox
          >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="allowCustom"
              @change="${this._toggleMainOption}"
              >Allow custom</anypoint-checkbox
            >
          </arc-interactive-demo>
        </div>
      </section>

      <section>
        <h3>Generated data</h3>
        <output>
${payloadResult ? payloadResult : 'Value not ready'}
        </output>
      </section>
    </section>`;
  }

  _render() {
    const {
      amf
    } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <api-view-model-transformer id="transformer" .amf="${amf}"></api-view-model-transformer>

      ${this._demoTemplate()}
      `, document.querySelector('#demo'));
  }
}
const instance = new ApiDemo();
instance.render();
window.demoInstance = instance;
