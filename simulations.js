/**
 * PDE Interactive Simulators
 * Implements real-time numerical solvers for Wave, Heat, and Laplace equations on HTML5 Canvas.
 */

// Common simulation state manager supporting multiple active simulators concurrently
class PdeSimulationManager {
  constructor() {
    this.activeSims = {}; // canvasId -> SimInstance
    this.isRunning = {}; // canvasId -> Boolean
    this.animationFrameIds = {}; // canvasId -> frameId
  }

  init(canvasId, type, controls) {
    this.stop(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Make canvas sharp on high DPI screens
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let sim = null;
    switch (type) {
      case 'wave':
        sim = new WaveSimulation(canvas, ctx, controls);
        break;
      case 'heat':
        sim = new HeatSimulation(canvas, ctx, controls);
        break;
      case 'laplace':
        sim = new LaplaceSimulation(canvas, ctx, controls);
        break;
      case 'transversality':
        sim = new TransversalitySimulation(canvas, ctx, controls);
        break;
    }

    if (sim) {
      this.activeSims[canvasId] = sim;
      sim.init();
      this.start(canvasId);
    }
  }

  start(canvasId) {
    if (this.isRunning[canvasId]) return;
    this.isRunning[canvasId] = true;
    
    const loop = () => {
      if (!this.isRunning[canvasId]) return;
      const sim = this.activeSims[canvasId];
      if (sim) {
        sim.update();
        sim.draw();
      }
      this.animationFrameIds[canvasId] = requestAnimationFrame(loop);
    };
    this.animationFrameIds[canvasId] = requestAnimationFrame(loop);
  }

  stop(canvasId) {
    this.isRunning[canvasId] = false;
    if (this.animationFrameIds[canvasId]) {
      cancelAnimationFrame(this.animationFrameIds[canvasId]);
      delete this.animationFrameIds[canvasId];
    }
    const sim = this.activeSims[canvasId];
    if (sim) {
      sim.cleanup();
      delete this.activeSims[canvasId];
    }
  }

  stopAll() {
    Object.keys(this.activeSims).forEach(canvasId => {
      this.stop(canvasId);
    });
  }

  reset(canvasId) {
    const sim = this.activeSims[canvasId];
    if (sim) {
      sim.reset();
    }
  }

  setParam(canvasId, name, value) {
    const sim = this.activeSims[canvasId];
    if (sim) {
      sim.setParam(name, value);
    }
  }
}

// ----------------------------------------------------
// 1. WAVE EQUATION SIMULATOR (1D String)
// Solves: u_tt = c^2 * u_xx
// ----------------------------------------------------
class WaveSimulation {
  constructor(canvas, ctx, controls) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.controls = controls;
    this.N = 120; // grid points
    this.u = new Float32Array(this.N);
    this.u_prev = new Float32Array(this.N);
    this.u_next = new Float32Array(this.N);
    
    // Physical parameters
    this.c = parseFloat(controls.speed || 2.0); // wave speed
    this.damping = parseFloat(controls.damping || 0.002); // damping coefficient
    this.boundary = controls.boundary || 'fixed'; // fixed or free
    
    this.isPlucking = false;
    this.pluckIndex = 0;
    this.pluckHeight = 0;

    // Mouse bindings
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    this.reset();
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    // Support touch devices
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const clientX = touch.clientX;
      const clientY = touch.clientY;
      this.onMouseDown({ clientX, clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const clientX = touch.clientX;
      const clientY = touch.clientY;
      this.onMouseMove({ clientX, clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    window.addEventListener('touchend', this.onMouseUp);
  }

  cleanup() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  reset() {
    this.u.fill(0);
    this.u_prev.fill(0);
    this.u_next.fill(0);
    
    // Set a default initial wave shape (harmonic sine wave)
    for (let i = 0; i < this.N; i++) {
      const x = i / (this.N - 1);
      this.u[i] = Math.sin(Math.PI * x) * 50;
      this.u_prev[i] = this.u[i];
    }
  }

  setParam(name, value) {
    if (name === 'speed') this.c = parseFloat(value);
    if (name === 'damping') this.damping = parseFloat(value);
    if (name === 'boundary') this.boundary = value;
  }

  update() {
    if (this.isPlucking) {
      // While plucking, the string shape is drawn by the mouse position
      this.u_prev.set(this.u);
      return;
    }

    const dt = 0.1;
    const dx = 1.0;
    // Courant number r = c * dt / dx. Must be <= 1 for stability.
    const r = (this.c * dt) / dx;
    const rSq = r * r;
    const dampingFactor = 1.0 - this.damping;

    // Finite difference scheme: Leapfrog
    for (let i = 1; i < this.N - 1; i++) {
      this.u_next[i] = (2 * this.u[i] - this.u_prev[i] + rSq * (this.u[i+1] - 2 * this.u[i] + this.u[i-1])) * dampingFactor;
    }

    // Boundary conditions
    if (this.boundary === 'fixed') {
      this.u_next[0] = 0;
      this.u_next[this.N - 1] = 0;
    } else {
      // Free boundary conditions: u_x = 0 => u[0] = u[1]
      this.u_next[0] = this.u_next[1] * dampingFactor;
      this.u_next[this.N - 1] = this.u_next[this.N - 2] * dampingFactor;
    }

    // Shift time buffers
    this.u_prev.set(this.u);
    this.u.set(this.u_next);
  }

  draw() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const centerY = height / 2;

    this.ctx.clearRect(0, 0, width, height);

    // Draw background grid lines (mathematical look)
    this.ctx.strokeStyle = '#151e36';
    this.ctx.lineWidth = 1;
    
    // Draw Y axis and center horizontal axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(width, centerY);
    this.ctx.stroke();

    for (let x = 0; x < width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Draw string
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    
    // Glow effect
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.strokeStyle = '#00f3ff';

    const stepX = width / (this.N - 1);
    for (let i = 0; i < this.N; i++) {
      const px = i * stepX;
      // Flip Y because canvas origin (0,0) is top-left
      const py = centerY - this.u[i];
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.stroke();
    
    // Draw boundary supports
    this.ctx.shadowBlur = 0; // turn off glow for supports
    this.ctx.fillStyle = '#6366f1';
    
    if (this.boundary === 'fixed') {
      // Draw two fixed pillars
      this.ctx.fillRect(0, centerY - 15, 6, 30);
      this.ctx.fillRect(width - 6, centerY - 15, 6, 30);
    } else {
      // Draw rings indicating free boundary
      this.ctx.strokeStyle = '#6366f1';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(3, centerY - this.u[0], 6, 0, Math.PI * 2);
      this.ctx.arc(width - 3, centerY - this.u[this.N - 1], 6, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  handleMouseDown(e) {
    if (e.preventDefault) e.preventDefault();
    this.isPlucking = true;
    this.updatePluck(e);
  }

  handleMouseMove(e) {
    if (!this.isPlucking) return;
    if (e.preventDefault) e.preventDefault();
    this.updatePluck(e);
  }

  handleMouseUp() {
    this.isPlucking = false;
  }

  updatePluck(e) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Calculate relative X, Y on the screen coordinate space
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    // Map to grid indices
    const relativeX = Math.max(0, Math.min(1, clickX / width));
    const targetIdx = Math.round(relativeX * (this.N - 1));
    const displacement = centerY - clickY; // positive is up

    // Apply smooth pluck shape (tent / triangle wave)
    const widthFactor = 15; // width of plucking finger
    for (let i = 0; i < this.N; i++) {
      const dist = Math.abs(i - targetIdx);
      if (dist < widthFactor) {
        const factor = 1.0 - (dist / widthFactor);
        this.u[i] = displacement * factor;
      } else {
        // smoothly decay other points to avoid discontinuous jump
        this.u[i] *= 0.85;
      }
    }
    
    // Keep boundaries locked if fixed
    if (this.boundary === 'fixed') {
      this.u[0] = 0;
      this.u[this.N - 1] = 0;
    }
  }
}

// ----------------------------------------------------
// 2. HEAT EQUATION SIMULATOR (1D Thermal Bar)
// Solves: u_t = alpha * u_xx
// ----------------------------------------------------
class HeatSimulation {
  constructor(canvas, ctx, controls) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.controls = controls;
    this.N = 100;
    this.u = new Float32Array(this.N);
    this.u_next = new Float32Array(this.N);

    this.alpha = parseFloat(controls.diffusion || 0.15); // Thermal diffusivity
    this.boundary = controls.boundary || 'insulated'; // insulated or fixed
    
    this.isHeating = false;

    // Mouse bindings
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    this.reset();
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    window.addEventListener('touchend', this.onMouseUp);
  }

  cleanup() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  reset() {
    this.u.fill(0);
    // Initial condition: heat source in the center
    const center = Math.floor(this.N / 2);
    for (let i = 0; i < this.N; i++) {
      const dist = Math.abs(i - center);
      if (dist < 15) {
        this.u[i] = 100 * (1 - dist / 15);
      }
    }
  }

  setParam(name, value) {
    if (name === 'diffusion') this.alpha = parseFloat(value);
    if (name === 'boundary') this.boundary = value;
  }

  update() {
    // Stability condition for explicit FTCS scheme: r = alpha * dt / dx^2 <= 0.5
    // Let's lock dt = 0.5, dx = 1.0, so r = alpha * 0.5. Since alpha <= 0.8, r <= 0.4 (stable)
    const dt = 0.5;
    const dx = 1.0;
    const r = (this.alpha * dt) / (dx * dx);

    for (let i = 1; i < this.N - 1; i++) {
      this.u_next[i] = this.u[i] + r * (this.u[i+1] - 2 * this.u[i] + this.u[i-1]);
    }

    // Boundary conditions
    if (this.boundary === 'insulated') {
      // Insulated: du/dn = 0 => u[0]=u[1], u[N]=u[N-1]
      this.u_next[0] = this.u[1];
      this.u_next[this.N - 1] = this.u[this.N - 2];
    } else {
      // Cold boundaries (fixed u = 0 at ends)
      this.u_next[0] = 0;
      this.u_next[this.N - 1] = 0;
    }

    this.u.set(this.u_next);
  }

  draw() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const barHeight = 40;
    const barY = height - barHeight - 30;
    const graphMaxY = barY - 30; // maximum Y coordinate for plotting the curve

    this.ctx.clearRect(0, 0, width, height);

    // Draw background grids
    this.ctx.strokeStyle = '#151e36';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw 1D bar gradient representing heat levels
    const stepX = width / (this.N - 1);
    
    // Draw thermal gradient bar
    for (let i = 0; i < this.N - 1; i++) {
      const x1 = i * stepX;
      const x2 = (i + 1) * stepX;
      
      const val1 = Math.max(0, Math.min(100, this.u[i])) / 100;
      const val2 = Math.max(0, Math.min(100, this.u[i+1])) / 100;

      // Color mapping: Blue (0%) -> Purple/Indigo -> Orange -> Red/White (100%)
      const grad = this.ctx.createLinearGradient(x1, barY, x2, barY);
      grad.addColorStop(0, `hsl(${240 - val1 * 240}, 90%, ${10 + val1 * 50}%)`);
      grad.addColorStop(1, `hsl(${240 - val2 * 240}, 90%, ${10 + val2 * 50}%)`);

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x1, barY, x2 - x1 + 1, barHeight);
    }

    // Outline the bar
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, barY, width, barHeight);

    // Draw Temperature curve line above the bar
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#f59e0b'; // Amber color for temperature graph
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#f59e0b';

    for (let i = 0; i < this.N; i++) {
      const px = i * stepX;
      // Map u value [0, 100] to Y coordinate [graphMaxY, 20]
      const py = graphMaxY - (this.u[i] / 100) * (graphMaxY - 20);
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0; // Turn off glow

    // Draw labels
    this.ctx.fillStyle = varColor('text-muted');
    this.ctx.font = '12px Assistant';
    this.ctx.fillText("פרופיל טמפרטורה (u)", 15, 25);
    this.ctx.fillText("מוט מוליך חום (1D)", 15, barY - 10);
  }

  handleMouseDown(e) {
    if (e.preventDefault) e.preventDefault();
    this.isHeating = true;
    this.applyHeat(e);
  }

  handleMouseMove(e) {
    if (!this.isHeating) return;
    if (e.preventDefault) e.preventDefault();
    this.applyHeat(e);
  }

  handleMouseUp() {
    this.isHeating = false;
  }

  applyHeat(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const relativeX = Math.max(0, Math.min(1, clickX / width));
    const targetIdx = Math.round(relativeX * (this.N - 1));

    // Add heat in a bell shape around cursor
    const heatRadius = 8;
    for (let i = 0; i < this.N; i++) {
      const dist = Math.abs(i - targetIdx);
      if (dist < heatRadius) {
        const amount = 35 * (1 - dist / heatRadius);
        this.u[i] = Math.min(150, this.u[i] + amount); // clamp max temp
      }
    }
  }
}

// ----------------------------------------------------
// 3. LAPLACE EQUATION SIMULATOR (2D Grid Relaxation)
// Solves: u_xx + u_yy = 0
// ----------------------------------------------------
class LaplaceSimulation {
  constructor(canvas, ctx, controls) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.controls = controls;
    
    // Grid sizes (lower resolution for speed and visual clarity)
    this.cols = 40;
    this.rows = 30;
    
    this.u = [];
    this.u_next = [];
    this.isFixed = []; // Boolean map for Dirichlet boundaries

    this.isDrawing = false;
    this.drawValue = 100; // Temperature to apply

    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    this.reset();
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }, { passive: false });

    window.addEventListener('touchend', this.onMouseUp);
  }

  cleanup() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  reset() {
    this.u = Array.from({ length: this.rows }, () => new Float32Array(this.cols));
    this.u_next = Array.from({ length: this.rows }, () => new Float32Array(this.cols));
    this.isFixed = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));

    // Define outer boundaries as fixed
    // Top boundary hot (e.g. 100), bottom cold (0), left and right linear interpolation
    for (let c = 0; c < this.cols; c++) {
      this.u[0][c] = 100; // Top wall hot
      this.isFixed[0][c] = 1;

      this.u[this.rows - 1][c] = 0; // Bottom wall cold
      this.isFixed[this.rows - 1][c] = 1;
    }

    for (let r = 0; r < this.rows; r++) {
      const val = 100 * (1 - r / (this.rows - 1));
      
      this.u[r][0] = val; // Left wall gradient
      this.isFixed[r][0] = 1;

      this.u[r][this.cols - 1] = val; // Right wall gradient
      this.isFixed[r][this.cols - 1] = 1;
    }

    // Set inside starting state to average
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        this.u[r][c] = 50;
      }
    }
  }

  setParam(name, value) {
    if (name === 'boundaryPreset') {
      this.reset();
      if (value === 'center-hotspot') {
        const midR = Math.floor(this.rows / 2);
        const midC = Math.floor(this.cols / 2);
        // Draw a hot ring in center
        for (let r = midR - 3; r <= midR + 3; r++) {
          for (let c = midC - 3; c <= midC + 3; c++) {
            if (r > 0 && r < this.rows - 1 && c > 0 && c < this.cols - 1) {
              this.u[r][c] = 100;
              this.isFixed[r][c] = 1;
            }
          }
        }
      } else if (value === 'center-coldspot') {
        const midR = Math.floor(this.rows / 2);
        const midC = Math.floor(this.cols / 2);
        for (let r = midR - 3; r <= midR + 3; r++) {
          for (let c = midC - 3; c <= midC + 3; c++) {
            if (r > 0 && r < this.rows - 1 && c > 0 && c < this.cols - 1) {
              this.u[r][c] = 0;
              this.isFixed[r][c] = 1;
            }
          }
        }
      }
    }
  }

  update() {
    // Run Jacobi relaxation solver
    // Perform multiple iterations per frame to speed up convergence
    const iterations = 8;
    for (let iter = 0; iter < iterations; iter++) {
      for (let r = 1; r < this.rows - 1; r++) {
        for (let c = 1; c < this.cols - 1; c++) {
          if (this.isFixed[r][c]) {
            this.u_next[r][c] = this.u[r][c]; // Keep fixed boundary nodes unchanged
          } else {
            // Laplace equation: u_ij = 0.25 * (u_{i+1,j} + u_{i-1,j} + u_{i,j+1} + u_{i,j-1})
            this.u_next[r][c] = 0.25 * (
              this.u[r+1][c] + 
              this.u[r-1][c] + 
              this.u[r][c+1] + 
              this.u[r][c-1]
            );
          }
        }
      }

      // Copy values back to active grid
      for (let r = 1; r < this.rows - 1; r++) {
        for (let c = 1; c < this.cols - 1; c++) {
          this.u[r][c] = this.u_next[r][c];
        }
      }
    }
  }

  draw() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.ctx.clearRect(0, 0, width, height);

    const cellW = width / this.cols;
    const cellH = height / this.rows;

    // Draw color map representing temperature
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = Math.max(0, Math.min(100, this.u[r][c])) / 100;
        
        // HSL mapping: Blue (Cold) -> Indigo -> Orange -> Red/White (Hot)
        const hue = 240 - val * 240;
        const sat = 90;
        const light = 15 + val * 45;
        this.ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        this.ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);

        // Highlight custom user-drawn boundary nodes with border lines
        if (this.isFixed[r][c] && r > 0 && r < this.rows - 1 && c > 0 && c < this.cols - 1) {
          this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }

  handleMouseDown(e) {
    if (e.preventDefault) e.preventDefault();
    this.isDrawing = true;
    // Right click or Shift-click draws 'cold' (0), Left-click draws 'hot' (100)
    this.drawValue = (e.button === 2 || e.shiftKey) ? 0 : 100;
    this.applyBrush(e);
  }

  handleMouseMove(e) {
    if (!this.isDrawing) return;
    if (e.preventDefault) e.preventDefault();
    this.applyBrush(e);
  }

  handleMouseUp() {
    this.isDrawing = false;
  }

  applyBrush(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Map screen click to grid cell coordinate
    const colIdx = Math.floor((clickX / width) * this.cols);
    const rowIdx = Math.floor((clickY / height) * this.rows);

    // Apply thick brush size (3x3 grid)
    const brushRadius = 1;
    for (let r = rowIdx - brushRadius; r <= rowIdx + brushRadius; r++) {
      for (let c = colIdx - brushRadius; c <= colIdx + brushRadius; c++) {
        if (r > 0 && r < this.rows - 1 && c > 0 && c < this.cols - 1) {
          this.u[r][c] = this.drawValue;
          this.isFixed[r][c] = 1; // Mark as fixed boundary node
        }
      }
    }
  }
}

// ----------------------------------------------------
// 4. TRANSVERSALITY & INITIAL CURVE SIMULATOR
// Visualizes the transversality condition between the initial curve and the characteristics
// ----------------------------------------------------
class TransversalitySimulation {
  constructor(canvas, ctx, controls) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.controls = controls;

    this.charType = controls.charType || 'horizontal';
    this.curveType = controls.curveType || 'line';
    this.angle = parseFloat(controls.angle !== undefined ? controls.angle : 90);
    this.offset = parseFloat(controls.offset !== undefined ? controls.offset : 0);

    this.pulseTime = 0;
  }

  init() {
    this.reset();
  }

  cleanup() {
    // No special cleanup needed
  }

  reset() {
    this.pulseTime = 0;
  }

  setParam(name, value) {
    if (name === 'charType') this.charType = value;
    if (name === 'curveType') this.curveType = value;
    if (name === 'angle') this.angle = parseFloat(value);
    if (name === 'offset') this.offset = parseFloat(value);
  }

  update() {
    this.pulseTime += 0.05;
  }

  draw() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, width, height);

    const scale = Math.min(width, height) / 22;
    const cx = width / 2;
    const cy = height / 2;

    const toScreen = (x, y) => ({
      x: cx + x * scale,
      y: cy - y * scale
    });

    // 1. Draw Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let x = -10; x <= 10; x += 2) {
      const pTop = toScreen(x, 10);
      const pBot = toScreen(x, -10);
      this.ctx.beginPath();
      this.ctx.moveTo(pTop.x, pTop.y);
      this.ctx.lineTo(pBot.x, pBot.y);
      this.ctx.stroke();

      const pLeft = toScreen(-10, x);
      const pRight = toScreen(10, x);
      this.ctx.beginPath();
      this.ctx.moveTo(pLeft.x, pLeft.y);
      this.ctx.lineTo(pRight.x, pRight.y);
      this.ctx.stroke();
    }

    // 2. Draw Characteristic Curves
    this.ctx.strokeStyle = 'rgba(74, 144, 226, 0.15)'; // subtle light blue
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);

    if (this.charType === 'horizontal') {
      for (let y = -9; y <= 9; y += 1.5) {
        const p1 = toScreen(-11, y);
        const p2 = toScreen(11, y);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    } else if (this.charType === 'diagonal') {
      for (let cVal = -15; cVal <= 15; cVal += 2.5) {
        const p1 = toScreen(-11, 11 + cVal);
        const p2 = toScreen(11, -11 + cVal);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    } else if (this.charType === 'circular') {
      for (let r = 1.5; r <= 11; r += 1.5) {
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
    this.ctx.setLineDash([]); // Reset line dash

    // 3. Generate initial curve points
    const points = [];
    const rad = (this.angle * Math.PI) / 180;
    const numPoints = 120;
    for (let i = 0; i <= numPoints; i++) {
      const s = -8 + (16 * i) / numPoints;
      let xLocal = s;
      let yLocal = 0;
      if (this.curveType === 'parabola') {
        yLocal = 0.08 * s * s - 2.5;
      } else if (this.curveType === 'sine') {
        yLocal = 2 * Math.sin(s / 1.5);
      }
      
      const xRot = xLocal * Math.cos(rad) - yLocal * Math.sin(rad);
      const yRot = xLocal * Math.sin(rad) + yLocal * Math.cos(rad);
      
      const x = xRot - (this.offset / 15) * Math.sin(rad);
      const y = yRot + (this.offset / 15) * Math.cos(rad);
      points.push({ x, y, s });
    }

    // 4. Calculate point states (tangent vs characteristic direction comparison)
    const states = [];
    let hasFailure = false;
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      let tx = next.x - prev.x;
      let ty = next.y - prev.y;
      const tLen = Math.sqrt(tx * tx + ty * ty);
      if (tLen > 0) {
        tx /= tLen;
        ty /= tLen;
      } else {
        tx = 1;
        ty = 0;
      }

      let cxDir = 1;
      let cyDir = 0;
      if (this.charType === 'diagonal') {
        cxDir = 1 / Math.sqrt(2);
        cyDir = -1 / Math.sqrt(2);
      } else if (this.charType === 'circular') {
        const d = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
        if (d > 0.01) {
          cxDir = -pt.y / d;
          cyDir = pt.x / d;
        } else {
          cxDir = 1;
          cyDir = 0;
        }
      }

      // Parallel check: determinant (tx * cyDir - ty * cxDir) close to 0
      const det = tx * cyDir - ty * cxDir;
      const isParallel = Math.abs(det) < 0.12; // tolerance for parallel (approx 7 degrees)
      if (isParallel) {
        hasFailure = true;
      }

      states.push({
        x: pt.x,
        y: pt.y,
        tx,
        ty,
        cx: cxDir,
        cy: cyDir,
        isParallel
      });
    }

    // 5. Draw the initial curve as colored segments
    this.ctx.lineWidth = 4;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = toScreen(points[i].x, points[i].y);
      const p2 = toScreen(points[i+1].x, points[i+1].y);
      
      const isSegParallel = states[i].isParallel || states[i+1].isParallel;
      
      this.ctx.strokeStyle = isSegParallel ? '#ff4d4d' : '#9b59b2'; // Red vs Purple
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    // 6. Draw sample vectors
    const sampleIndices = [20, 40, 60, 80, 100];
    sampleIndices.forEach(idx => {
      const state = states[idx];
      const scr = toScreen(state.x, state.y);

      // Tangent vector arrow (Purple)
      const arrowLength = 1.3 * scale;
      const drawArrow = (fromX, fromY, dx, dy, color) => {
        const toX = fromX + dx * arrowLength;
        const toY = fromY - dy * arrowLength;

        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2.5;

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        const angle = Math.atan2(-dy, dx);
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - 8 * Math.cos(angle - Math.PI/6), toY - 8 * Math.sin(angle - Math.PI/6));
        this.ctx.lineTo(toX - 8 * Math.cos(angle + Math.PI/6), toY - 8 * Math.sin(angle + Math.PI/6));
        this.ctx.closePath();
        this.ctx.fill();
      };

      drawArrow(scr.x, scr.y, state.cx, state.cy, '#e67e22'); // Orange (char)
      drawArrow(scr.x, scr.y, state.tx, state.ty, '#9b59b2'); // Purple (tangent)

      if (state.isParallel) {
        const pulseRadius = 5 + Math.sin(this.pulseTime) * 3;
        this.ctx.fillStyle = 'rgba(255, 77, 77, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(scr.x, scr.y, pulseRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#ff4d4d';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(scr.x, scr.y, pulseRadius + 3, 0, Math.PI * 2);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(scr.x, scr.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // 7. Status Panel Overlay
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.strokeStyle = hasFailure ? 'rgba(255, 77, 77, 0.4)' : 'rgba(46, 204, 113, 0.4)';
    this.ctx.lineWidth = 2;
    const boxW = width - 40;
    const boxH = 55;
    const boxX = 20;
    const boxY = height - boxH - 20;
    
    // Manual cross-browser rounded rect (r=8)
    const r = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + r, boxY);
    this.ctx.lineTo(boxX + boxW - r, boxY);
    this.ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
    this.ctx.lineTo(boxX + boxW, boxY + boxH - r);
    this.ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
    this.ctx.lineTo(boxX + r, boxY + boxH);
    this.ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
    this.ctx.lineTo(boxX, boxY + r);
    this.ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = hasFailure ? '#ff8080' : '#2ecc71';
    this.ctx.font = 'bold 14px Inter, system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'right';
    
    const textStatus = hasFailure 
      ? '✗ תנאי הטרנסוורסליות נכשל! עקום ההתחלה משיק או מקביל לאופיינים.' 
      : '✓ תנאי הטרנסוורסליות מתקיים! ניתן לקבל פתרון יחיד למשוואה.';
    this.ctx.fillText(textStatus, width - 35, boxY + 22);

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.font = '11px Inter, system-ui, -apple-system, sans-serif';
    const textDesc = hasFailure
      ? 'הווקטורים (סגול וכתום) מקבילים בנקודות האדומות, ולכן המידע אינו יכול להתפשט.'
      : 'בכל נקודה, וקטור המשיק (סגול) ווקטור האופיין (כתום) מצביעים לכיוונים שונים.';
    this.ctx.fillText(textDesc, width - 35, boxY + 42);
    
    // 8. Legend labels (top left)
    this.ctx.textAlign = 'right';
    
    this.ctx.fillStyle = '#9b59b2';
    this.ctx.beginPath();
    this.ctx.arc(width - 30, 25, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = '11px Inter, sans-serif';
    this.ctx.fillText('וקטור המשיק לעקום ההתחלה', width - 42, 28);

    this.ctx.fillStyle = '#e67e22';
    this.ctx.beginPath();
    this.ctx.arc(width - 30, 42, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillText('וקטור הכיוון האופייני', width - 42, 45);
  }
}

// Utility function to fetch CSS variables dynamically
function varColor(cssVarName) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${cssVarName}`).trim();
}

// Create and export global instance
const simulatorManager = new PdeSimulationManager();
