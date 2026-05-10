import { expect } from '@bundled-es-modules/chai';
import { html, render } from 'lit';
import '../src/document-preview.js';

describe('DocumentPreview', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('document-preview');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.items).to.deep.equal([]);
      expect(element.open).to.be.false;
      expect(element.initialIndex).to.equal(0);
      expect(element.loop).to.be.false;
      expect(element.closeOnOverlay).to.be.true;
      expect(element.closeOnEscape).to.be.true;
      expect(element.downloadable).to.be.true;
      expect(element.displayMode).to.equal('modal');
    });

    it('should set items property', () => {
      const items = [
        { type: 'image', url: 'test.jpg', name: 'Test Image' },
        { type: 'pdf', url: 'test.pdf', name: 'Test PDF' }
      ];
      
      element.items = items;
      expect(element.items).to.deep.equal(items);
    });

    it('should set open property', () => {
      element.open = true;
      expect(element.open).to.be.true;
      
      element.open = false;
      expect(element.open).to.be.false;
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      element.items = [
        { type: 'image', url: 'image1.jpg', name: 'Image 1' },
        { type: 'pdf', url: 'document.pdf', name: 'Document' },
        { type: 'image', url: 'image2.jpg', name: 'Image 2' }
      ];
    });

    it('should navigate to specific index', () => {
      element.goTo(1);
      expect(element._currentIndex).to.equal(1);
    });

    it('should not navigate to invalid index', () => {
      element.goTo(10);
      expect(element._currentIndex).to.equal(0);
      
      element.goTo(-1);
      expect(element._currentIndex).to.equal(0);
    });

    it('should navigate to next item', () => {
      element._currentIndex = 0;
      element.next();
      expect(element._currentIndex).to.equal(1);
    });

    it('should navigate to previous item', () => {
      element._currentIndex = 1;
      element.prev();
      expect(element._currentIndex).to.equal(0);
    });

    it('should open at specific index', () => {
      element.openAt(2);
      expect(element.open).to.be.true;
      expect(element._currentIndex).to.equal(2);
    });
  });

  describe('Events', () => {
    it('should fire open event when opened', (done) => {
      element.addEventListener('open', () => {
        done();
      });
      
      element.open = true;
    });

    it('should fire close event when closed', (done) => {
      element.addEventListener('close', () => {
        done();
      });
      
      element.open = true;
      element.open = false;
    });

    it('should fire item-change event when index changes', (done) => {
      element.items = [
        { type: 'image', url: 'image1.jpg', name: 'Image 1' },
        { type: 'pdf', url: 'document.pdf', name: 'Document' }
      ];
      
      element.addEventListener('item-change', (event) => {
        expect(event.detail.previousIndex).to.equal(0);
        expect(event.detail.currentIndex).to.equal(1);
        expect(event.detail.item).to.deep.equal(element.items[1]);
        done();
      });
      
      element.open = true;
      element.goTo(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes when open', () => {
      element.open = true;
      
      return element.updateComplete.then(() => {
        const overlay = element.shadowRoot.querySelector('.overlay');
        expect(overlay.getAttribute('role')).to.equal('dialog');
        expect(overlay.getAttribute('aria-modal')).to.equal('true');
      });
    });

    it('should have correct ARIA attributes in inline mode', () => {
      element.displayMode = 'inline';
      element.open = true;
      
      return element.updateComplete.then(() => {
        const overlay = element.shadowRoot.querySelector('.overlay');
        expect(overlay.getAttribute('aria-modal')).to.equal('false');
      });
    });
  });

  describe('Rendering', () => {
    it('should render nothing when closed', () => {
      element.open = false;
      
      return element.updateComplete.then(() => {
        const overlay = element.shadowRoot.querySelector('.overlay');
        expect(overlay).to.be.null;
      });
    });

    it('should render overlay when open', () => {
      element.items = [{ type: 'image', url: 'test.jpg', name: 'Test' }];
      element.open = true;
      
      return element.updateComplete.then(() => {
        const overlay = element.shadowRoot.querySelector('.overlay');
        expect(overlay).to.not.be.null;
        
        const container = element.shadowRoot.querySelector('.container');
        expect(container).to.not.be.null;
      });
    });

    it('should render inline controls in inline mode', () => {
      element.displayMode = 'inline';
      element.items = [{ type: 'image', url: 'test.jpg', name: 'Test' }];
      element.open = true;
      
      return element.updateComplete.then(() => {
        const inlineControls = element.shadowRoot.querySelector('.inline-controls');
        expect(inlineControls).to.not.be.null;
      });
    });
  });
});
