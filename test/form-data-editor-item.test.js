import {
  fixture,
  assert,
  nextFrame,
  html
} from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../form-data-editor-item.js';

describe('<form-data-editor-item>', function() {
  async function basicFixture() {
    return await fixture(html `
      <form-data-editor-item></form-data-editor-item>
    `);
  }

  async function modelItemFixture() {
    const model = {
      hasDescription: true,
      description: 'test-description',
      name: 'test-name',
      value: 'tets-value',
      schema: {
        inputLabel: 'test',
        examples: [{
          name: 'title',
          hasName: true,
          value: 'example-value'
        }]
      }
    };
    return await fixture(html `
      <form-data-editor-item
        .model="${model}"
        name="test-name"
        value="test-value"></form-data-editor-item>
    `);
  }

  async function customItemFixture() {
    const model = {
      name: 'test-name',
      value: 'tets-value',
      schema: {
        examples: [{
          name: 'title',
          hasName: true,
          value: 'example-value'
        }]
      }
    };
    return await fixture(html `
      <form-data-editor-item
        .model="${model}"
        name="test-name"
        value="test-value"
        iscustom></form-data-editor-item>
    `);
  }

  describe('_computeDocumentation()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns empty string when no properties', () => {
      const result = element._computeDocumentation({});
      assert.equal(result, '');
    });

    it('returns description part', () => {
      const result = element._computeDocumentation({
        description: 'test'
      });
      assert.equal(result, 'test');
    });

    it('returns pattern part', () => {
      const result = element._computeDocumentation({
        schema: {
          pattern: 'test'
        }
      });
      assert.equal(result, '- Pattern: `test`\n');
    });

    it('adds new lines after description', () => {
      const result = element._computeDocumentation({
        description: 'test',
        schema: {
          pattern: 'test'
        }
      });
      assert.equal(result, 'test\n\n\n- Pattern: `test`\n');
    });

    it('adds examples', () => {
      const result = element._computeDocumentation({
        schema: {
          examples: [{
            value: 'test'
          }]
        }
      });
      assert.equal(result, '- Example: `test`\n');
    });

    it('adds title for example', () => {
      const result = element._computeDocumentation({
        schema: {
          examples: [{
            value: 'test',
            name: 'title',
            hasName: true
          }]
        }
      });
      assert.equal(result, '- Example title: `test`\n');
    });

    it('ignores examples without a value', () => {
      const result = element._computeDocumentation({
        schema: {
          examples: [{
            name: 'title',
            hasName: true
          }]
        }
      });
      assert.equal(result, '');
    });
  });

  describe('_computeHasDocumentation()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns false when noDocs', () => {
      const result = element._computeHasDocumentation(true, {
        hasDescription: true
      });
      assert.isFalse(result);
    });

    it('returns true when hasDescription', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: true
      });
      assert.isTrue(result);
    });

    it('returns false when no schema', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: false
      });
      assert.isFalse(result);
    });

    it('returns true when has a patter', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: false,
        schema: {
          pattern: true
        }
      });
      assert.isTrue(result);
    });

    it('returns true when has examples', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: false,
        schema: {
          examples: [{
            value: 'test',
            name: 'title',
            hasName: true
          }]
        }
      });
      assert.isTrue(result);
    });

    it('returns false when example has no value', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: false,
        schema: {
          examples: [{
            name: 'title',
            hasName: true
          }]
        }
      });
      assert.isFalse(result);
    });

    it('returns false otherwise', () => {
      const result = element._computeHasDocumentation(false, {
        hasDescription: false,
        schema: {}
      });
      assert.isFalse(result);
    });
  });

  describe('Model item', () => {
    let element;
    beforeEach(async () => {
      element = await modelItemFixture();
    });

    it('renders api-property-form-item', async () => {
      const node = element.shadowRoot.querySelector('api-property-form-item');
      assert.ok(node);
    });

    it('renders hint icon', async () => {
      const node = element.shadowRoot.querySelector('.hint-icon');
      assert.ok(node);
    });

    it('does not render description by default', async () => {
      const node = element.shadowRoot.querySelector('.docs');
      assert.notOk(node);
    });

    it('renders description after hint button click', async () => {
      const button = element.shadowRoot.querySelector('.hint-icon');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('.docs');
      assert.ok(node);
    });

    it('does not render description when no docs is set', async () => {
      element.noDocs = true;
      const button = element.shadowRoot.querySelector('.hint-icon');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('.docs');
      assert.notOk(node);
    });

    it('renders description after hint icon click', async () => {
      const button = element.shadowRoot.querySelector('.hint-icon .icon');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('.docs');
      assert.ok(node);
    });

    it('disaptches change event on value change', () => {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      const node = element.shadowRoot.querySelector('api-property-form-item');
      node.value = 'test-changed';
      assert.equal(spy.args[0][0].detail.value, 'test-changed');
    });
  });

  describe('Custom item', () => {
    let element;
    beforeEach(async () => {
      element = await customItemFixture();
    });

    it('renders custom inputs', async () => {
      const node = element.shadowRoot.querySelector('.custom-inputs');
      assert.ok(node);
    });

    it('renders remove icon', async () => {
      const node = element.shadowRoot.querySelector('.delete-icon');
      assert.ok(node);
    });

    it('does not render description', async () => {
      const node = element.shadowRoot.querySelector('.docs');
      assert.notOk(node);
    });

    it('disaptches name change event on name change', () => {
      const spy = sinon.spy();
      element.addEventListener('name-changed', spy);
      const node = element.shadowRoot.querySelector('.param-name');
      node.value = 'test-name-changed';
      assert.equal(spy.args[0][0].detail.value, 'test-name-changed');
    });

    it('disaptches value change event on name change', () => {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      const node = element.shadowRoot.querySelector('.param-value');
      node.value = 'test-value-changed';
      assert.equal(spy.args[0][0].detail.value, 'test-value-changed');
    });

    it('disaptches remove event on remove icon click', () => {
      const spy = sinon.spy();
      element.addEventListener('remove', spy);
      const button = element.shadowRoot.querySelector('.delete-icon');
      MockInteractions.tap(button);
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('a11y', () => {
    it('is accessible with model values', async () => {
      const element = await modelItemFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with custom values', async () => {
      const element = await customItemFixture();
      await assert.isAccessible(element);
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });
});
