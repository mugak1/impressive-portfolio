const tpl = document.createElement('template');
tpl.innerHTML = `
  <article class="card" part="card">
    <div class="card-media" part="media"></div>
    <div class="card-body" part="body">
      <h3 class="card-title" part="title"></h3>
      <p class="card-desc" part="desc"></p>
      <ul class="card-tags" part="tags" role="list"></ul>
      <div class="card-actions" part="actions">
        <a class="btn" part="btn" data-demo target="_blank" rel="noopener">Live demo</a>
        <a class="btn" part="btn" data-github target="_blank" rel="noopener">Code</a>
      </div>
    </div>
  </article>
  <style>
    .card { border: 1px solid var(--border); background: var(--card); border-radius: var(--radius); overflow: clip; box-shadow: var(--shadow);
            transform-style: preserve-3d; transition: transform .2s ease-out; }
    .card-media { height: 140px; background: linear-gradient(120deg, color-mix(in oklab, var(--brand) 25%, transparent), color-mix(in oklab, var(--accent) 25%, transparent)); }
    .card-body { padding: 14px; }
    .card-title { margin: 0 0 6px; font-size: 20px; }
    .card-desc { margin: 0 0 10px; color: var(--muted); }
    .card-tags { margin: 0 0 12px; padding: 0; display: flex; gap: 6px; flex-wrap: wrap; list-style: none; }
    .card-tags li { font-size: 12px; border: 1px solid var(--border); padding: 2px 8px; border-radius: 999px; background: #fff1; }
    .card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  </style>
`;

export class ProjectCard extends HTMLElement {
  static get observedAttributes() { return ['data-title','data-desc','data-tags','data-demo','data-github']; }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.el = {
      media: this.shadowRoot.querySelector('.card-media'),
      title: this.shadowRoot.querySelector('.card-title'),
      desc: this.shadowRoot.querySelector('.card-desc'),
      tags: this.shadowRoot.querySelector('.card-tags'),
      demo: this.shadowRoot.querySelector('[data-demo]'),
      github: this.shadowRoot.querySelector('[data-github]'),
      card: this.shadowRoot.querySelector('.card')
    };
    this.addTilt();
    this.addEventListener('click', () => this.dispatchEvent(new CustomEvent('card-click', { bubbles: true, composed: true })));
  }
  attributeChangedCallback() { this.render(); }
  render() {
    const title = this.getAttribute('data-title') || '';
    const desc = this.getAttribute('data-desc') || '';
    const tags = (this.getAttribute('data-tags') || '').split(',').filter(Boolean);
    const demo = this.getAttribute('data-demo') || '#';
    const github = this.getAttribute('data-github') || '#';

    this.el.title.textContent = title;
    this.el.desc.textContent = desc;
    this.el.tags.innerHTML = tags.map(t => `<li>${t}</li>`).join('');
    this.el.demo.href = demo;
    this.el.github.href = github;
    this.el.media.style.backgroundImage = `linear-gradient(120deg, color-mix(in oklab, var(--brand) 24%, transparent), color-mix(in oklab, var(--accent) 24%, transparent)),
      radial-gradient(60% 60% at 40% 40%, color-mix(in oklab, var(--brand) 20%, transparent), transparent 70%)`;
    this.el.media.style.backgroundSize = 'cover';
  }
  addTilt() {
    const card = this.el.card;
    let bounds = null;
    const update = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const px = (e.clientX - bounds.left) / bounds.width - 0.5;
      const py = (e.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg)`;
    };
    const reset = () => { card.style.transform = 'rotateX(0) rotateY(0)'; bounds = null; };
    card.addEventListener('pointermove', update);
    card.addEventListener('pointerleave', reset);
  }
}
customElements.define('project-card', ProjectCard);
