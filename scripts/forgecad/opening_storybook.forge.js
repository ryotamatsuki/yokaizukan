/**
 * Opening storybook depth model.
 *
 * This ForgeCAD scene is used as a dimensional guide and render source for the
 * encyclopedia opening animation. The app itself stays static HTML/CSS/JS.
 */

scene({
  background: { top: '#1f2634', bottom: '#4a3523' },
  camera: {
    position: [220, -260, 135],
    target: [0, 0, 26],
    fov: 36,
  },
  lights: [
    { type: 'ambient', color: '#fff1c4', intensity: 0.42 },
    { type: 'directional', position: [140, -160, 220], color: '#ffe5a8', intensity: 1.55 },
    { type: 'point', position: [-130, -120, 70], color: '#8cb9d1', intensity: 0.6, distance: 360, decay: 1.5 },
  ],
  postProcessing: {
    toneMappingExposure: 1.08,
    vignette: { darkness: 0.26, offset: 0.28 },
  },
  views: {
    hero: {
      camera: {
        position: [220, -260, 135],
        target: [0, 0, 26],
        fov: 36,
      },
    },
  },
});

function makePart(name, shape, color, material = {}) {
  return {
    name,
    shape: shape.color(color).material({
      roughness: 0.82,
      metalness: 0.02,
      ...material,
    }),
  };
}

const parts = [];

// Warm wooden tabletop and the closed-book cover swinging open.
parts.push(makePart('warm wooden table plane', box(270, 190, 7).translate(0, 0, -10), '#5b3924'));
parts.push(makePart('open indigo cover board', box(126, 166, 5)
  .translate(-126, 0, 5)
  .rotateY(-68, { pivot: [-62, 0, 4] }), '#172944', { roughness: 0.95 }));
parts.push(makePart('cover gold corner hint', box(25, 25, 3)
  .translate(-153, 68, 13)
  .rotateY(-68, { pivot: [-62, 0, 4] }), '#b8862d', { metalness: 0.32, roughness: 0.38 }));

// Open page slabs and visible page thickness.
parts.push(makePart('left washi page slab', box(122, 162, 3).translate(-61, 0, 0), '#f2dfb8'));
parts.push(makePart('right washi page slab', box(122, 162, 3).translate(61, 0, 0), '#f5e7c7'));
parts.push(makePart('center spine trough', cylinder(162, 4.2).pointAlong([0, 1, 0]).translate(0, 0, -1), '#8a5a2d'));

for (let index = 0; index < 6; index += 1) {
  const offset = index * 1.15;
  parts.push(makePart(`front page layer ${index + 1}`, box(238 - index * 3, 2.2, 1.1)
    .translate(0, -83 - offset, -2.4 - index * 0.18), '#d9bd82'));
  parts.push(makePart(`right page side layer ${index + 1}`, box(2.2, 154 - index * 2, 1.1)
    .translate(123 + offset * 0.45, -1, -2.2 - index * 0.18), '#d2b27a'));
}

// Folded paper scenery: cards stand up from the spread like a pop-up book.
parts.push(makePart('back sky paper card', box(220, 3, 70)
  .translate(0, 44, 31)
  .rotateX(-8, { pivot: [0, 44, 0] }), '#26405f'));
parts.push(makePart('middle mountain paper card', box(192, 4, 48)
  .translate(0, 26, 24)
  .rotateX(-13, { pivot: [0, 26, 0] }), '#6d8a72'));
parts.push(makePart('front river paper card', box(155, 5, 19)
  .translate(0, -5, 10)
  .rotateX(-18, { pivot: [0, -5, 0] }), '#5b95ad'));

// Simple raised details that give the renderer real parallax and shadows.
parts.push(makePart('moon disk', cylinder(2.4, 14)
  .pointAlong([0, -1, 0])
  .translate(56, 42, 62), '#f7d77f', { roughness: 0.45 }));
parts.push(makePart('left bamboo cluster', cylinder(42, 2.2)
  .translate(-86, 14, 7)
  .rotateX(-10), '#476d3c'));
parts.push(makePart('right pine crown', sphere(18).scale([1.35, 0.7, 0.45]).translate(78, 12, 37), '#395f38'));
parts.push(makePart('right pine trunk', cylinder(35, 3).translate(78, 10, 7), '#6b4327'));

// Small stage markers for where yokai images pop into the CSS animation.
const markerColor = '#d4a64a';
for (const [index, x] of [-70, -32, 8, 48, 84].entries()) {
  parts.push(makePart(`popup yokai landing marker ${index + 1}`, cylinder(1.4, 7)
    .translate(x, -34 + (index % 2) * 11, 2.6), markerColor, { metalness: 0.12, roughness: 0.55 }));
}

return parts;
