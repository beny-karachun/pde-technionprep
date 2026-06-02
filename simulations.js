/**
 * PDE Interactive Simulators
 * Implements real-time numerical solvers for Wave, Heat, and Laplace equations on HTML5 Canvas.
 */

// Common simulation state manager
class PdeSimulationManager {
  constructor() {
    this.currentSim = null;
    this.animationFrameId = null;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
  }

  init(canvasId, type, controls) {
    this.stop();
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Make canvas sharp on high DPI screens
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    switch (type) {
      case 'wave':
        this.currentSim = new WaveSimulation(this.canvas, this.ctx, controls);
        break;
      case 'heat':
        this.currentSim = new HeatSimulation(this.canvas, this.ctx, controls);
        break;
      case 'laplace':
        this.currentSim = new LaplaceSimulation(this.canvas, this.ctx, controls);
        break;
    }

    if (this.currentSim) {
      this.currentSim.init();
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      if (this.currentSim) {
        this.currentSim.update();
        this.currentSim.draw();
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.currentSim) {
      this.currentSim.cleanup();
      this.currentSim = null;
    }
  }

  reset() {
    if (this.currentSim) {
      this.currentSim.reset();
    }
  }

  setParam(name, value) {
    if (this.currentSim) {
      this.currentSim.setParam(name, value);
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

// Utility function to fetch CSS variables dynamically
function varColor(cssVarName) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${cssVarName}`).trim();
}

// Create and export global instance
const simulatorManager = new PdeSimulationManager();
