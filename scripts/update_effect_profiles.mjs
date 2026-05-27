import fs from "node:fs";
import path from "node:path";

const yokaiPath = path.join("public", "data", "yokai.json");
const effectAssetsPath = path.join("public", "data", "effect_assets.json");
const effectPromptsPath = path.join("public", "data", "effect_generation_prompts.json");

const profiles = {
  kappa: {
    animationProfile: {
      stage: "water",
      enterEffect: "splashIn",
      tapEffect: "waterSplash",
      actionLabel: "みずしぶき！",
      sound: "splash.mp3",
      effectAssets: [
        "public/assets/effects/water/water_splash.webp",
        "public/assets/effects/water/ripple.webp",
        "public/assets/effects/water/water_drops.webp"
      ]
    },
    specialMove: {
      label: "みずのうずまき！",
      effect: "kappaWaterSpiral",
      sound: "special_water_spiral.mp3",
      assets: [
        "public/assets/effects/water/water_spiral.webp",
        "public/assets/effects/water/big_splash.webp",
        "public/assets/effects/water/water_drops.webp"
      ]
    }
  },
  tengu: {
    animationProfile: {
      stage: "mountain",
      enterEffect: "windIn",
      tapEffect: "leafWind",
      actionLabel: "かぜ！",
      sound: "wind.mp3",
      effectAssets: [
        "public/assets/effects/wind/wind_swirl.webp",
        "public/assets/effects/wind/leaves.webp",
        "public/assets/effects/wind/feather.webp"
      ]
    },
    specialMove: {
      label: "てんぐの大かぜ！",
      effect: "tenguGreatWind",
      sound: "special_wind.mp3",
      assets: [
        "public/assets/effects/wind/wind_tornado.webp",
        "public/assets/effects/wind/flying_leaves.webp",
        "public/assets/effects/wind/feathers.webp"
      ]
    }
  },
  oni: {
    animationProfile: {
      stage: "cave",
      enterEffect: "stompIn",
      tapEffect: "clubStomp",
      actionLabel: "どん！",
      sound: "drum.mp3",
      effectAssets: [
        "public/assets/effects/impact/impact_burst.webp",
        "public/assets/effects/impact/dust.webp",
        "public/assets/effects/impact/shockwave.webp"
      ]
    },
    specialMove: {
      label: "おにのどん！",
      effect: "oniStomp",
      sound: "special_oni_drum.mp3",
      assets: [
        "public/assets/effects/impact/impact_burst.webp",
        "public/assets/effects/impact/dust_cloud.webp",
        "public/assets/effects/impact/shockwave.webp"
      ]
    }
  },
  rokurokubi: {
    animationProfile: {
      stage: "room",
      enterEffect: "fadeIn",
      tapEffect: "neckStretch",
      actionLabel: "のびる！",
      sound: "stretch.mp3",
      effectAssets: [
        "public/assets/effects/magic/spooky_trail.webp",
        "public/assets/effects/magic/stretch_shadow.webp"
      ]
    },
    specialMove: {
      label: "にょろりんサーチ！",
      effect: "rokurokubiSearch",
      sound: "special_stretch.mp3",
      assets: [
        "public/assets/effects/magic/stretch_line.webp",
        "public/assets/effects/magic/sparkle_trail.webp"
      ]
    }
  },
  nekomata: {
    animationProfile: {
      stage: "night",
      enterEffect: "walkIn",
      tapEffect: "tailWiggle",
      actionLabel: "にゃん！",
      sound: "cat.mp3",
      effectAssets: [
        "public/assets/effects/cat/tail_trail.webp",
        "public/assets/effects/cat/pawprints.webp"
      ]
    },
    specialMove: {
      label: "ねこまたダンス！",
      effect: "nekomataDance",
      sound: "special_cat_dance.mp3",
      assets: [
        "public/assets/effects/cat/pawprint_circle.webp",
        "public/assets/effects/cat/tail_trail.webp",
        "public/assets/effects/cat/moon_sparkle.webp"
      ]
    }
  },
  "karakasa-kozo": {
    animationProfile: {
      stage: "street",
      enterEffect: "hopIn",
      tapEffect: "umbrellaJump",
      actionLabel: "ぴょん！",
      sound: "hop.mp3",
      effectAssets: [
        "public/assets/effects/pop/jump_dust.webp",
        "public/assets/effects/pop/pop_mark.webp"
      ]
    },
    specialMove: {
      label: "からかさジャンプ！",
      effect: "karakasaBigJump",
      sound: "special_jump.mp3",
      assets: [
        "public/assets/effects/pop/paper_confetti.webp",
        "public/assets/effects/pop/jump_dust.webp",
        "public/assets/effects/pop/star_pop.webp"
      ]
    }
  },
  "chochin-obake": {
    animationProfile: {
      stage: "night",
      enterEffect: "glowIn",
      tapEffect: "lanternGlow",
      actionLabel: "ぽわん！",
      sound: "glow.mp3",
      effectAssets: [
        "public/assets/effects/glow/lantern_glow.webp",
        "public/assets/effects/glow/warm_light.webp"
      ]
    },
    specialMove: {
      label: "ぽわぽわライト！",
      effect: "chochinLightBurst",
      sound: "special_glow.mp3",
      assets: [
        "public/assets/effects/glow/lantern_light_burst.webp",
        "public/assets/effects/glow/warm_light_orbs.webp"
      ]
    }
  },
  "yuki-onna": {
    animationProfile: {
      stage: "snow",
      enterEffect: "snowFadeIn",
      tapEffect: "snowBreath",
      actionLabel: "ゆき！",
      sound: "snow.mp3",
      effectAssets: [
        "public/assets/effects/snow/snow_crystal.webp",
        "public/assets/effects/snow/cold_mist.webp"
      ]
    },
    specialMove: {
      label: "ゆきのまほう！",
      effect: "yukiOnnaSnowMagic",
      sound: "special_snow_magic.mp3",
      assets: [
        "public/assets/effects/snow/snow_magic_circle.webp",
        "public/assets/effects/snow/ice_crystals.webp",
        "public/assets/effects/snow/cold_mist.webp"
      ]
    }
  },
  nurikabe: {
    animationProfile: {
      stage: "road",
      enterEffect: "wallSlideIn",
      tapEffect: "wallBump",
      actionLabel: "どーん！",
      sound: "bump.mp3",
      effectAssets: [
        "public/assets/effects/wall/wall_shadow.webp",
        "public/assets/effects/wall/dust_slide.webp"
      ]
    },
    specialMove: {
      label: "ぬりかべガード！",
      effect: "nurikabeGuard",
      sound: "special_wall.mp3",
      assets: [
        "public/assets/effects/wall/wall_guard.webp",
        "public/assets/effects/wall/stone_dust.webp",
        "public/assets/effects/wall/impact_ring.webp"
      ]
    }
  },
  gashadokuro: {
    animationProfile: {
      stage: "moon",
      enterEffect: "shadowRise",
      tapEffect: "boneRattle",
      actionLabel: "カタカタ！",
      sound: "rattle.mp3",
      effectAssets: [
        "public/assets/effects/bone/bone_fragments.webp",
        "public/assets/effects/bone/giant_shadow_soft.webp",
        "public/assets/effects/bone/moon_glow.webp"
      ]
    },
    specialMove: {
      label: "ほねほねパレード！",
      effect: "gashadokuroBoneParade",
      sound: "special_bone_rattle.mp3",
      assets: [
        "public/assets/effects/bone/bone_fragments.webp",
        "public/assets/effects/bone/giant_shadow_soft.webp",
        "public/assets/effects/bone/moon_glow.webp"
      ]
    }
  }
};

const assetPrompts = {
  water: "水しぶき、波紋、水滴、水のうずまきなどの水系エフェクト素材。",
  wind: "天狗の団扇から出るような風、葉っぱ、羽根のエフェクト素材。",
  impact: "鬼がどんっと登場したときの丸い衝撃、土ぼこり、衝撃波素材。",
  magic: "ろくろ首の首が伸びる印象を助ける、やさしい魔法線と光の軌跡素材。",
  cat: "猫又のしっぽや足あと、月のきらめきを表す猫系エフェクト素材。",
  pop: "からかさ小僧が跳ねるときの砂ぼこり、紙吹雪、星のポップ素材。",
  glow: "提灯お化けのあたたかい光、発光、光の玉の素材。",
  snow: "雪女の雪の結晶、氷、冷気、雪の魔法素材。",
  wall: "ぬりかべの壁、石ぼこり、守りの波紋を表す素材。",
  bone: "がしゃどくろの骨片、やわらかな巨大影、月光素材。"
};

const data = JSON.parse(fs.readFileSync(yokaiPath, "utf8"));
const items = Array.isArray(data) ? data : data.items;
if (!Array.isArray(items)) {
  throw new Error("public/data/yokai.json must be an array or an object with an items array.");
}
for (const item of items) {
  const profile = profiles[item.id];
  if (profile) {
    item.animationProfile = profile.animationProfile;
    item.specialMove = profile.specialMove;
  }
}
fs.writeFileSync(yokaiPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const usageByPath = new Map();
for (const [yokaiId, profile] of Object.entries(profiles)) {
  for (const assetPath of profile.animationProfile.effectAssets) {
    const entry = usageByPath.get(assetPath) || { usedBy: new Set(), usedFor: new Set() };
    entry.usedBy.add(yokaiId);
    entry.usedFor.add("tapEffect");
    usageByPath.set(assetPath, entry);
  }
  for (const assetPath of profile.specialMove.assets) {
    const entry = usageByPath.get(assetPath) || { usedBy: new Set(), usedFor: new Set() };
    entry.usedBy.add(yokaiId);
    entry.usedFor.add("specialMove");
    usageByPath.set(assetPath, entry);
  }
}

const effectFiles = fs
  .readdirSync(path.join("public", "assets", "effects"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".webp"))
  .map((entry) => path.join(entry.parentPath, entry.name).replaceAll("\\", "/"))
  .sort();

const effectAssets = effectFiles.map((file) => {
  const normalizedPath = file.replace(/^.*?public\//, "public/");
  const category = normalizedPath.split("/").at(-2);
  const id = path.basename(normalizedPath, ".webp");
  const usage = usageByPath.get(normalizedPath);
  return {
    id,
    path: normalizedPath,
    category,
    usedBy: usage ? [...usage.usedBy] : [],
    usedFor: usage ? [...usage.usedFor] : ["support"],
    fallbackClass: `fallback-${id.replaceAll("_", "-")}`,
    status: "available"
  };
});
fs.writeFileSync(effectAssetsPath, `${JSON.stringify(effectAssets, null, 2)}\n`, "utf8");

const effectPrompts = effectAssets.map((asset) => ({
  id: asset.id,
  path: asset.path,
  promptJa: `子ども向け妖怪図鑑アプリで使う、透明背景の${asset.category}系エフェクト素材。${assetPrompts[asset.category] || "妖怪画像に重ねて使う楽しい効果素材。"}和風絵本調。怖すぎない。背景なし。余白あり。文字なし。ロゴなし。UIなし。`,
  status: "generated"
}));
fs.writeFileSync(effectPromptsPath, `${JSON.stringify(effectPrompts, null, 2)}\n`, "utf8");

console.log(`Updated ${Object.keys(profiles).length} yokai effect profiles.`);
console.log(`Wrote ${effectAssets.length} effect asset records.`);
