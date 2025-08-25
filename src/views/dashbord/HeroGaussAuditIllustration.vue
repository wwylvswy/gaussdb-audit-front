<!-- 首页SVG -->
<template>
  <div class="gauss-3d-hero" :style="cssVars">
    <svg
      viewBox="0 0 1440 750"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Gauss Database 3D Visualization"
      class="gauss-svg"
    >
      <!-- 定义滤镜：3D光照与高光 -->
      <defs>
        <!-- 二进制流遮罩 -->
        <mask id="binaryMask">
          <rect x="0" y="0" width="1440" height="750" fill="white" />
          <text
            v-for="line in binaryLines"
            :key="line.key"
            :x="line.x"
            :y="line.y"
            class="binary-text"
            :style="{ fontSize: line.size + 'px' }"
          >
            {{ line.text }}
          </text>
        </mask>

        <!-- 高斯曲面光照滤镜（优化：降低复杂度 + 固定seed + 降低分辨率） -->
        <filter id="gaussFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            :baseFrequency="0.0045"
            numOctaves="2"
            result="noise"
            :seed="seed"
            filterRes="180"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feSpecularLighting
            result="spec"
            specularConstant="0.7"
            specularExponent="18"
            lighting-color="var(--color-primary)"
            surfaceScale="2"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feSpecularLighting>
          <feComposite
            in="spec"
            in2="SourceAlpha"
            operator="in"
            result="specAlpha"
          />
          <feMerge>
            <feMergeNode in="specAlpha" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- 粒子发光滤镜 -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- LLM 渐变 -->
        <radialGradient id="llmCoreGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#3b82f6" />
        </radialGradient>
        <linearGradient id="llmRingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#93c5fd" stop-opacity="0" />
          <stop offset="50%" stop-color="#60a5fa" stop-opacity="1" />
          <stop offset="100%" stop-color="#93c5fd" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="llmRingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bfdbfe" stop-opacity="0" />
          <stop offset="50%" stop-color="#93c5fd" stop-opacity="1" />
          <stop offset="100%" stop-color="#bfdbfe" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 背景 -->
      <rect width="1440" height="750" fill="#FFFFFF" />

      <!-- Title -->
      <text
        x="50%"
        y="100"
        text-anchor="middle"
        fill="#94a3b8"
        font-size="48"
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        Gauss数据库智能评审助手
      </text>
      <text
        x="50%"
        y="150"
        text-anchor="middle"
        fill="#94a3b8"
        font-size="22"
        font-family="Arial, sans-serif"
      >
        Intelligent Review Assistant for GaussDB
      </text>

      <!-- 3D高斯曲面（滤镜GPU合成） -->
      <g class="gauss-surface" filter="url(#gaussFilter)">
        <path
          v-for="layer in 8"
          :key="layer"
          :d="generateGaussPath(layer)"
          :fill="`hsla(220,80%,${70 - layer * 5}%,${0.1 + layer * 0.1})`"
          :style="{ animationDelay: `${layer * 0.2}s` }"
        />
      </g>

      <!-- Central LLM Engine（统一CSS动画） -->
      <g transform="translate(722, 380)">
        <!-- Pulsing Core -->
        <circle
          cx="0"
          cy="0"
          r="50"
          fill="url(#llmCoreGradient)"
          class="llm-core"
        />
        <!-- Orbiting Particles -->
        <g class="orbit orbit-1">
          <circle cx="0" cy="-80" r="8" fill="#93c5fd" opacity="0.7" />
          <circle
            cx="0"
            cy="-80"
            r="6"
            fill="#bfdbfe"
            opacity="0.9"
            style="animation-delay: -5s"
          />
        </g>
        <g class="orbit orbit-2">
          <circle cx="0" cy="80" r="8" fill="#93c5fd" opacity="0.7" />
          <circle
            cx="0"
            cy="80"
            r="6"
            fill="#bfdbfe"
            opacity="0.9"
            style="animation-delay: -7s"
          />
        </g>
        <!-- Rotating Rings -->
        <g>
          <circle
            cx="0"
            cy="0"
            r="90"
            fill="none"
            stroke="url(#llmRingGradient1)"
            stroke-width="1"
            stroke-dasharray="5,5"
            class="ring ring-1"
          />
          <circle
            cx="0"
            cy="0"
            r="110"
            fill="none"
            stroke="url(#llmRingGradient2)"
            stroke-width="1"
            stroke-dasharray="10,10"
            class="ring ring-2"
          />
        </g>
        <text
          x="0"
          y="150"
          text-anchor="middle"
          fill="#e2e8f0"
          font-size="20"
          font-weight="bold"
        >
          LLM Engine
        </text>
      </g>

      <!-- 抽象神经元网络 -->
      <g class="neural-network">
        <!-- 神经元节点 -->
        <circle
          v-for="(node, index) in neuralNodes"
          :key="index"
          :cx="node.x"
          :cy="node.y"
          r="3"
          :fill="`var(--color-primary)`"
          class="neuron-node"
          :style="{ '--delay': `${node.delay}s` }"
        />
        <!-- 神经连接 -->
        <line
          v-for="(conn, idx) in neuralConnections"
          :key="idx"
          :x1="conn.from.x"
          :y1="conn.from.y"
          :x2="conn.to.x"
          :y2="conn.to.y"
          stroke="var(--color-secondary)"
          stroke-width="0.5"
          opacity="0.3"
        />
      </g>

      <!-- 动态粒子流（纯CSS动画 + 统一GPU合成） -->
      <g class="data-particles" filter="url(#glow)">
        <circle
          v-for="(p, i) in particles"
          :key="i"
          class="particle"
          r="1.5"
          :cx="p.x"
          :cy="p.y"
          :fill="`var(--color-primary)`"
          :style="{
            '--delay': p.delay + 's',
            '--duration': p.duration + 's',
            '--start-x': p.x + 'px'
          }"
        />
      </g>

      <!-- 二进制代码流（遮罩呈现） -->
      <g mask="url(#binaryMask)">
        <rect
          x="0"
          y="0"
          width="1440"
          height="750"
          fill="var(--color-primary)"
          opacity="0.03"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive } from "vue";

/** Props 定义 */
interface Props {
  primaryColor?: string;
  secondaryColor?: string;
  animate?: boolean;
  showBinary?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  primaryColor: "#2563EB",
  secondaryColor: "#7C3AED",
  animate: true,
  showBinary: true
});

/** CSS 变量注入 */
const cssVars = computed(() => ({
  "--color-primary": props.primaryColor,
  "--color-secondary": props.secondaryColor
}));

/** 固定随机种子（录屏避免随机导致的抖动） */
const seed = 1337;
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(seed);

/** 生成高斯曲面路径（简化3D投影） */
const generateGaussPath = (layer: number): string => {
  const points: string[] = [];
  const amplitude = 100 - layer * 8;
  const yOffset = 400 - layer * 10;
  for (let x = 0; x <= 1440; x += 40) {
    const y = yOffset - amplitude * Math.exp(-Math.pow((x - 720) / 300, 2));
    points.push(`${x},${y}`);
  }
  return `M ${points.join(" L ")} L 1440,750 L 0,750 Z`;
};

/** 神经元节点（使用固定种子随机） */
const neuralNodes = reactive(
  Array.from({ length: 24 }, () => ({
    x: 400 + rand() * 640,
    y: 200 + rand() * 300,
    delay: rand() * 3
  }))
);

/** 神经连接 */
const neuralConnections = computed(() => {
  const connections: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  }[] = [];
  for (let i = 0; i < neuralNodes.length; i++) {
    for (let j = i + 1; j < neuralNodes.length; j++) {
      if (
        Math.hypot(
          neuralNodes[i].x - neuralNodes[j].x,
          neuralNodes[i].y - neuralNodes[j].y
        ) < 120
      ) {
        connections.push({ from: neuralNodes[i], to: neuralNodes[j] });
      }
    }
  }
  return connections;
});

/** 粒子系统（一次性初始化，动画用CSS驱动） */
const particles = ref(
  Array.from({ length: 40 }, () => ({
    x: rand() * 1440, // 初始位置
    y: 250 + rand() * 250,
    delay: rand() * 5 + (rand() > 0.5 ? 2 : 0),
    duration: 6 + rand() * 4 // 6~10s
  }))
);

/** 二进制流（固定种子随机，避免录屏随机差异） */
const binaryLines = computed(() =>
  props.showBinary
    ? Array.from({ length: 15 }, (_, i) => {
        const size = 12 + Math.floor(rand() * 8);
        const x = 1100 + rand() * 100;
        const text = Array.from({ length: 16 }, () =>
          rand() > 0.5 ? 1 : 0
        ).join("");
        return {
          key: `${i}-${x.toFixed(2)}-${size}`,
          x,
          y: 50 + i * 40,
          size,
          text
        };
      })
    : []
);
</script>

<style lang="scss" scoped>
.gauss-3d-hero {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: auto; /* 自适应高度 */
  aspect-ratio: 1440 / 750; /* 保持宽高比 */
}

.gauss-svg {
  display: block;
  width: 100%;
  height: 100%;
  /* GPU 合成层优化 */
  will-change: transform, filter, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout paint; /* 降低重排、重绘范围 */
}

/* 高斯曲面脉动（轻量透明度动画） */
.gauss-surface path {
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

/* LLM Core 呼吸 */
.llm-core {
  transform-box: fill-box;
  transform-origin: center;
  animation: corePulse 3s ease-in-out infinite;
  will-change: transform, opacity;
}
@keyframes corePulse {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

/* 轨道旋转（统一CSS动画，不混用SMIL） */
.orbit {
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}
.orbit-1 {
  animation: orbitCW 10s linear infinite;
}
.orbit-2 {
  animation: orbitCCW 12s linear infinite;
}

@keyframes orbitCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes orbitCCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/* 环形线条旋转 */
.ring {
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}
.ring-1 {
  animation: ringSpinCW 25s linear infinite;
}
.ring-2 {
  animation: ringSpinCCW 30s linear infinite;
}

@keyframes ringSpinCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes ringSpinCCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/* 神经元节点闪烁 */
.neuron-node {
  animation: blink 2s infinite;
  animation-delay: var(--delay);
  will-change: opacity, r;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes blink {
  0%,
  80%,
  100% {
    r: 3;
    opacity: 0.7;
  }
  90% {
    r: 5;
    opacity: 1;
  }
}

/* 粒子流动（纯CSS，避免JS改DOM） */
.data-particles .particle {
  transform-box: fill-box;
  transform-origin: center;
  /* 初始平移在 0，使用变量控制 */
  animation: moveParticle var(--duration) linear infinite;
  animation-delay: var(--delay);
  will-change: transform, opacity;
}
@keyframes moveParticle {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    /* 视口宽度为 1440（viewBox），移动 1440px */
    transform: translateX(1440px);
    opacity: 0;
  }
}

/* 二进制代码样式（轻量透明度动画） */
.binary-text {
  fill: var(--color-primary);
  font-family: "Courier New", monospace;
  opacity: 0.15;
  letter-spacing: 1px;
  animation: fadeBinary 4s ease-in-out infinite;
  will-change: opacity;
}
@keyframes fadeBinary {
  0%,
  100% {
    opacity: 0.05;
  }
  50% {
    opacity: 0.15;
  }
}

/* 辅助：尊重系统降低动画设置 */
@media (prefers-reduced-motion: reduce) {
  .gauss-surface path,
  .llm-core,
  .orbit,
  .ring,
  .neuron-node,
  .data-particles .particle,
  .binary-text {
    animation: none !important;
  }
}
</style>
