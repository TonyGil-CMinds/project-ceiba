"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  const int RIPPLE_COUNT = 8;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform vec2 uRippleCenters[RIPPLE_COUNT];
  uniform float uRippleTimes[RIPPLE_COUNT];
  uniform float uTime;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 screen, vec2 image) {
    float screenRatio = screen.x / screen.y;
    float imageRatio = image.x / image.y;
    vec2 scale = vec2(1.0);

    if (screenRatio > imageRatio) {
      scale.y = imageRatio / screenRatio;
    } else {
      scale.x = screenRatio / imageRatio;
    }

    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uResolution, uImageResolution);
    vec2 displacement = vec2(0.0);
    float highlight = 0.0;
    float aspect = uResolution.x / uResolution.y;

    for (int i = 0; i < RIPPLE_COUNT; i++) {
      float age = uTime - uRippleTimes[i];

      if (age > 0.0 && age < 2.25) {
        vec2 center = vec2(uRippleCenters[i].x, 1.0 - uRippleCenters[i].y);
        vec2 delta = vUv - center;
        vec2 circularDelta = vec2(delta.x * aspect, delta.y);
        float distanceToCenter = length(circularDelta);
        float radius = age * 0.22;
        float ring = exp(-abs(distanceToCenter - radius) * 48.0);
        float fade = smoothstep(2.25, 0.0, age);
        float ripple = ring * fade;
        vec2 circularDirection = normalize(circularDelta + 0.0001);
        vec2 direction = vec2(circularDirection.x / aspect, circularDirection.y);

        displacement += direction * ripple * 0.026;
        displacement += direction * sin(distanceToCenter * 86.0 - age * 14.0) * ripple * 0.004;
        highlight += ripple * 0.18;
      }
    }

    vec2 displacedUv = uv + displacement;
    vec4 color = texture2D(uTexture, displacedUv);
    vec4 cleanColor = texture2D(uTexture, uv);

    color.rgb = mix(cleanColor.rgb, color.rgb, 0.96);
    color.rgb = pow(color.rgb, vec3(0.74)) * 1.12;
    color.rgb = clamp(color.rgb, 0.0, 1.0);
    gl_FragColor = color;
  }
`;

export default function WaterBackground({ src }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let animationFrame = 0;
    let rippleIndex = 0;
    let lastRippleTime = 0;
    const rippleCenters = Array.from({ length: 8 }, () => new THREE.Vector2(0.5, 0.5));
    const rippleTimes = Array.from({ length: 8 }, () => -10);

    const texture = new THREE.TextureLoader().load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uImageResolution: { value: new THREE.Vector2(1280, 768) },
        uRippleCenters: { value: rippleCenters },
        uRippleTimes: { value: rippleTimes },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    texture.onUpdate = () => {
      if (texture.image) {
        material.uniforms.uImageResolution.value.set(texture.image.width, texture.image.height);
      }
    };

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
    };

    const addRipple = (event, force = false) => {
      const now = performance.now();

      if (!force && now - lastRippleTime < 115) {
        return;
      }

      lastRippleTime = now;
      rippleCenters[rippleIndex].set(
        event.clientX / window.innerWidth,
        event.clientY / window.innerHeight
      );
      rippleTimes[rippleIndex] = material.uniforms.uTime.value;
      material.uniforms.uRippleTimes.value = rippleTimes;
      rippleIndex = (rippleIndex + 1) % rippleCenters.length;
    };

    const updatePointer = (event) => {
      addRipple(event);
    };

    const handlePointerDown = (event) => {
      addRipple(event, true);
    };

    const tick = (time) => {
      material.uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerdown", handlePointerDown);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", handlePointerDown);
      texture.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, [src]);

  return <canvas className="water-background" ref={canvasRef} aria-hidden="true" />;
}
