/**
 * Ziorse Obsidian & Glass Spatial Canvas Engine
 */

class SpatialPhysicsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.nodes = [];
    this.stars = [];

    this.camera = { x: 0, y: 0, zoom: 1 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    this.hoveredNode = null;
    this.selectedNode = null;

    this.onNodeSelectCallback = null;

    this.initCanvasSize();
    this.generateStarfield();
    this.setupEventListeners();
  }

  initCanvasSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight - 42;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  generateStarfield() {
    this.stars = [];
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        size: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  setNodes(nodeDataList) {
    this.nodes = nodeDataList.map(item => {
      const existing = this.nodes.find(n => n.id === item.id);
      if (existing) {
        return { ...item, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy };
      }
      return { ...item };
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());

    this.canvas.addEventListener('mousedown', (e) => {
      const mouseWorld = this.screenToWorld(e.clientX, e.clientY);
      const clickedNode = this.getNodeAt(mouseWorld.x, mouseWorld.y);

      if (clickedNode) {
        this.selectedNode = clickedNode;
        if (window.audioSynth) window.audioSynth.playNodeSelect();
        if (this.onNodeSelectCallback) this.onNodeSelectCallback(clickedNode);
      } else {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.camera.x, y: e.clientY - this.camera.y };
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.camera.x = e.clientX - this.dragStart.x;
        this.camera.y = e.clientY - this.dragStart.y;
      } else {
        const mouseWorld = this.screenToWorld(e.clientX, e.clientY);
        const prevHover = this.hoveredNode;
        this.hoveredNode = this.getNodeAt(mouseWorld.x, mouseWorld.y);

        if (this.hoveredNode && !prevHover) {
          if (window.audioSynth) window.audioSynth.playNodeHover();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.06 : 0.94;
      this.camera.zoom = Math.min(2.2, Math.max(0.5, this.camera.zoom * zoomFactor));
    });
  }

  screenToWorld(sx, sy) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const wx = (sx - cx - this.camera.x) / this.camera.zoom;
    const wy = (sy - cy - this.camera.y) / this.camera.zoom;
    return { x: wx, y: wy };
  }

  getNodeAt(wx, wy) {
    return this.nodes.find(n => {
      const dx = n.x - wx;
      const dy = n.y - wy;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius;
    });
  }

  updatePhysics() {
    const len = this.nodes.length;
    if (len === 0) return;

    for (let i = 0; i < len; i++) {
      let n1 = this.nodes[i];
      n1.vx -= n1.x * 0.0002;
      n1.vy -= n1.y * 0.0002;

      for (let j = i + 1; j < len; j++) {
        let n2 = this.nodes[j];
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let dist = Math.hypot(dx, dy) || 1;

        if (dist < 200) {
          let force = (200 - dist) * 0.0006;
          let fx = (dx / dist) * force;
          let fy = (dy / dist) * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }

      n1.vx *= 0.92;
      n1.vy *= 0.92;
      n1.x += n1.vx;
      n1.y += n1.vy;
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    this.ctx.save();
    this.ctx.translate(cx + this.camera.x, cy + this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    // 1. Render Subtle Starfield
    this.stars.forEach(star => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Render Clean Connecting Beams
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        let n1 = this.nodes[i];
        let n2 = this.nodes[j];
        let dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

        if (dist < 280) {
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(n1.x, n1.y);
          this.ctx.lineTo(n2.x, n2.y);
          this.ctx.stroke();
        }
      }
    }

    // 3. Render Nodes (Apple/Obsidian Style Tiles & Circles)
    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;

      // Glow background
      const glowGrad = this.ctx.createRadialGradient(node.x, node.y, node.radius * 0.2, node.x, node.y, node.radius * 2.2);
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      glowGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Circle Base
      this.ctx.fillStyle = '#09090b';
      this.ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1;

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Inner Accent Dot
      this.ctx.fillStyle = node.color || '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Label below
      this.ctx.fillStyle = isHovered ? '#ffffff' : '#a1a1aa';
      this.ctx.font = '500 12px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.author, node.x, node.y + node.radius + 16);
    });

    this.ctx.restore();
  }

  start() {
    const loop = () => {
      if (this.canvas && this.canvas.offsetParent !== null) {
        this.updatePhysics();
        this.render();
        requestAnimationFrame(loop);
      } else {
        setTimeout(loop, 400);
      }
    };
    loop();
  }
}

window.SpatialPhysicsEngine = SpatialPhysicsEngine;
