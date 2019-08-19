import {
  fixture,
  assert,
  nextFrame,
  html
} from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../form-data-editor.js';

describe('<form-data-editor>', function() {
  async function basicFixture() {
    return await fixture(html `
      <form-data-editor></form-data-editor>
    `);
  }

  async function customFixture() {
    return await fixture(html `
      <form-data-editor allowcustom></form-data-editor>
    `);
  }

  async function allowDisabledFixture() {
    const model = [{
      name: 'name',
      value: 'value',
      schema: {
        enabled: true
      }
    }];
    return await fixture(html `
      <form-data-editor allowdisableparams .model="${model}"></form-data-editor>
    `);
  }

  async function allowHideOptionalFixture() {
    const model = [{
      binding: 'query',
      name: 'i1',
      required: false,
      schema: {}
    }, {
      binding: 'query',
      name: 'i2',
      required: true,
      schema: {}
    }];
    return await fixture(html `
      <form-data-editor allowhideoptional .model="${model}"></form-data-editor>
    `);
  }

  async function mixedModelFixture() {
    const model = [{
      binding: 'query',
      name: 'i1',
      value: 'v1',
      required: false,
      schema: {
        isCustom: false,
        enabled: true,
        inputLabel: 'label1'
      }
    }, {
      binding: 'query',
      name: 'i2',
      required: false,
      value: 'v2',
      schema: {
        enabled: true,
        isCustom: true,
        inputLabel: 'label2'
      }
    }, {
      binding: 'query',
      name: 'i3',
      required: true,
      value: 'v3',
      schema: {
        enabled: true,
        isCustom: true,
        inputLabel: 'label3'
      }
    }];
    return await fixture(html `
      <form-data-editor allowhideoptional allowcustom allowdisableparams .model="${model}"></form-data-editor>
    `);
  }

  describe('Custom properties', () => {
    it('does not render add button by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.action-button');
      assert.notOk(node);
    });

    it('renders add button when enabled', async () => {
      const element = await customFixture();
      const node = element.shadowRoot.querySelector('.action-button');
      assert.ok(node);
    });

    it('adds new item when button is clicked', async () => {
      const element = await customFixture();
      const button = element.shadowRoot.querySelector('.add-action .action-button');
      MockInteractions.tap(button);
      assert.lengthOf(element.model, 1);
    });
  });

  describe('Allowing disabling parameters', () => {
    it('does not render toggle button by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.enable-checkbox');
      assert.notOk(node);
    });

    it('renders add button when enabled', async () => {
      const element = await allowDisabledFixture();
      const node = element.shadowRoot.querySelector('.enable-checkbox');
      assert.ok(node);
    });

    it('removes item from value when clicked', async () => {
      const element = await allowDisabledFixture();
      const button = element.shadowRoot.querySelector('.enable-checkbox');
      MockInteractions.tap(button);
      await nextFrame();
      assert.equal(element.value, '');
    });

    it('adds item back to the value', async () => {
      const element = await allowDisabledFixture();
      const button = element.shadowRoot.querySelector('.enable-checkbox');
      MockInteractions.tap(button);
      await nextFrame();
      MockInteractions.tap(button);
      await nextFrame();
      assert.equal(element.value, 'name=value');
    });
  });

  describe('Optional parameters', () => {
    it('hiddes optional item', async () => {
      const element = await allowHideOptionalFixture();
      const node = element.shadowRoot.querySelector('.form-item');
      const dispaly = getComputedStyle(node).display;
      assert.equal(dispaly, 'none');
    });

    it('always renders required items', async () => {
      const element = await allowHideOptionalFixture();
      const node = element.shadowRoot.querySelectorAll('.form-item')[1];
      const dispaly = getComputedStyle(node).display;
      assert.notEqual(dispaly, 'none');
    });

    it('renders optional toggle checkbox', async () => {
      const element = await allowHideOptionalFixture();
      const node = element.shadowRoot.querySelector('.toggle-checkbox');
      assert.ok(node);
    });

    it('renders hidden items when checkbox is clicked', async () => {
      const element = await allowHideOptionalFixture();
      const node = element.shadowRoot.querySelector('.toggle-checkbox');
      MockInteractions.tap(node);
      await nextFrame();
      const item = element.shadowRoot.querySelector('.form-item');
      const dispaly = getComputedStyle(item).display;
      assert.notEqual(dispaly, 'none');
    });
  });

  describe('add()', () => {
    let element;
    beforeEach(async () => {
      element = await customFixture();
    });

    it('Adds item to model', () => {
      element.add();
      assert.lengthOf(element.model, 1);
    });

    it('Added item has empty value', () => {
      element.add();
      assert.equal(element.model[0].value, '');
    });

    it('Added item has empty name', () => {
      element.add();
      assert.equal(element.model[0].name, '');
    });
  });

  describe('_encodePaylod()', () => {
    let element;
    const TEST_VALUE = 'x test=x value';

    beforeEach(async () => {
      element = await basicFixture();
      element.value = TEST_VALUE;
      await nextFrame();
    });

    it('Encodes value', async () => {
      element._encodePaylod();
      await nextFrame();
      assert.equal(element.value, 'x+test=x+value');
    });

    it('Encodes model value', async () => {
      element._encodePaylod();
      await nextFrame();
      assert.equal(element.model[0].value, 'x+value');
    });

    it('Encodes model value name', async () => {
      element._encodePaylod();
      await nextFrame();
      assert.equal(element.model[0].name, 'x+test');
    });
  });

  describe('_decodePaylod()', () => {
    let element;
    const TEST_VALUE = 'x+test=x+value';

    beforeEach(async () => {
      element = await basicFixture();
      element.value = TEST_VALUE;
      await nextFrame();
    });

    it('Decodes value', async () => {
      element._decodePaylod();
      await nextFrame();
      assert.equal(element.value, 'x test=x value');
    });

    it('Decodes model value', async () => {
      element._decodePaylod();
      await nextFrame();
      assert.equal(element.model[0].value, 'x value');
    });

    it('Decodes model value name', async () => {
      element._decodePaylod();
      await nextFrame();
      assert.equal(element.model[0].name, 'x test');
    });
  });

  describe('_valueChanged()', () => {
    let element;
    const TEST_VALUE = 'x+test=x+value&param=value';

    beforeEach(async () => {
      element = await basicFixture();
      element._valueChanged(TEST_VALUE);
    });

    it('Creates model array', () => {
      assert.typeOf(element.model, 'array');
    });

    it('Model has 2 items', () => {
      assert.lengthOf(element.model, 2);
    });

    it('Generates items in order', () => {
      assert.equal(element.model[0].name, 'x test');
      assert.equal(element.model[1].name, 'param');
    });

    it('Model has valid values', () => {
      assert.equal(element.model[0].value, 'x value');
      assert.equal(element.model[1].value, 'value');
    });
  });

  describe('Removing parameter', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.value = 'x+test=x+value';
      await nextFrame();
    });

    it('Removes item from the event', () => {
      const item = element.shadowRoot.querySelector('form-data-editor-item');
      item.dispatchEvent(new CustomEvent('remove'));
      assert.lengthOf(element.model, 0);
      assert.equal(element.value, '');
    });
  });

  describe('Enabled handler', () => {
    let element;
    beforeEach(async () => {
      element = await mixedModelFixture();
    });

    it('updates model for the item', async () => {
      const button = element.shadowRoot.querySelector('.enable-checkbox');
      MockInteractions.tap(button);
      await nextFrame();
      assert.isFalse(element.model[0].schema.enabled);
    });

    it('calls _updateValue()', async () => {
      const spy = sinon.spy(element, '_updateValue');
      const button = element.shadowRoot.querySelector('.enable-checkbox');
      MockInteractions.tap(button);
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('updates the value', async () => {
      const button = element.shadowRoot.querySelector('.enable-checkbox');
      MockInteractions.tap(button);
      await nextFrame();
      assert.equal(element.value, 'i2=v2&i3=v3');
    });
  });

  describe('Value handler', () => {
    const newValue = 'test-updated';
    let element;
    beforeEach(async () => {
      element = await mixedModelFixture();
    });

    it('updates model for the item', async () => {
      const item = element.shadowRoot.querySelector('form-data-editor-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.equal(element.model[0].value, newValue);
    });

    it('calls _updateValue()', async () => {
      const spy = sinon.spy(element, '_updateValue');
      const item = element.shadowRoot.querySelector('form-data-editor-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('updates the value', async () => {
      const item = element.shadowRoot.querySelector('form-data-editor-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.equal(element.value, 'i1=test-updated&i2=v2&i3=v3');
    });
  });

  describe('Name handler', () => {
    const newValue = 'test-updated';
    let element;
    let item;
    beforeEach(async () => {
      element = await mixedModelFixture();
      item = element.shadowRoot.querySelectorAll('form-data-editor-item')[1];
    });

    it('updates model for the item', async () => {
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.equal(element.model[1].name, newValue);
    });

    it('calls _updateValue()', async () => {
      const spy = sinon.spy(element, '_updateValue');
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('updates the name', async () => {
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: newValue
        }
      }));
      await nextFrame();
      assert.equal(element.value, 'i1=v1&test-updated=v2&i3=v3');
    });
  });

  describe('onmodel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onmodel);
      const f = () => {};
      element.onmodel = f;
      assert.isTrue(element.onmodel === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onmodel = f;
      element.model = [];
      element.onmodel = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onmodel = f1;
      element.onmodel = f2;
      element.model = [];
      element.onmodel = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onchange', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      element.value = 'a=b';
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      element.value = 'a=b';
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    it('is accessible - all fields types', async () => {
      const element = await mixedModelFixture();
      assert.isAccessible(element);
    });
  });
});
